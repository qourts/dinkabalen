import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readLatestPublication} from "./read-publication.mjs";
const base={projectUrl:"https://uiymcsbioevuyyoeirba.supabase.co",
  publishableKey:"sb_publishable_testonly",eventId:"dinkabalen-2026",
  scheduleFingerprint:"a".repeat(64)};
const snapshot=()=>({eventId:base.eventId,scheduleFingerprint:base.scheduleFingerprint,
  eventDate:"2026-12-05",fixtures:Array.from({length:67},(_,i)=>({id:"M"+i})),
  roster:Object.fromEntries(Array.from({length:30},(_,i)=>["T"+i,{players:["",""]}])),results:{}});
const response=(rows,status=200)=>async()=>({ok:status>=200&&status<300,status,json:async()=>rows});
const row=(s=snapshot())=>({revision:1,published_at:"2026-11-07T10:00:00Z",
  source_sha256:createHash("sha256").update(JSON.stringify(s)).digest("hex"),snapshot:s});
test("no official publication means unpublished",async()=>{
 assert.deepEqual(await readLatestPublication({...base,fetcher:response([])}),{state:"unpublished"});
});
test("valid published snapshot is returned with version",async()=>{
 const r=await readLatestPublication({...base,fetcher:response([row()])});
 assert.equal(r.state,"ready");assert.equal(r.revision,1);assert.equal(r.snapshot.fixtures.length,67);
});
test("digest mismatch rejected",async()=>{
 const r=row();r.source_sha256="f".repeat(64);
 assert.equal((await readLatestPublication({...base,fetcher:response([r])})).state,"invalid");
});
test("wrong event rejected",async()=>{
 const s=snapshot();s.eventId="other";
 assert.equal((await readLatestPublication({...base,fetcher:response([row(s)])})).state,"invalid");
});
test("network failure never masquerades as fresh",async()=>{
 const r=await readLatestPublication({...base,fetcher:async()=>{throw Error("offline")}});
 assert.equal(r.state,"unavailable");
});
test("HTTP 401 never masquerades as unpublished",async()=>{
 const r=await readLatestPublication({...base,fetcher:response(null,401)});
 assert.equal(r.state,"unavailable");assert.equal(r.reason,"http_401");
});
test("missing publishable key rejected before fetch",async()=>{
 const r=await readLatestPublication({...base,publishableKey:"",fetcher:async()=>{throw Error("should not call")}});
 assert.equal(r.state,"configuration_error");
});
test("invalid API shape rejected",async()=>{
 const r=await readLatestPublication({...base,fetcher:response({})});
 assert.equal(r.state,"invalid");
});

/**
 * Read-only Supabase publication transport for Dinkabalen Player Portal.
 * This file is NOT activated by the existing public index.html.
 * Callers must render stale/unavailable states explicitly, never infer live.
 */
const isObject=x=>x!==null && typeof x==="object" && !Array.isArray(x);
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");

export async function readLatestPublication({
  projectUrl, publishableKey, eventId="dinkabalen-2026",
  scheduleFingerprint, fetcher=fetch
}) {
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(String(projectUrl||"")))
    return {state:"configuration_error",reason:"invalid_project_url"};
  if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(String(publishableKey||"")))
    return {state:"configuration_error",reason:"missing_publishable_key"};
  if(!/^[a-f0-9]{64}$/.test(String(scheduleFingerprint||"")))
    return {state:"configuration_error",reason:"missing_schedule_fingerprint"};
  const params=new URLSearchParams({
    select:"revision,source_sha256,published_at,snapshot",
    event_id:"eq."+eventId,
    order:"revision.desc",
    limit:"1"
  });
  let rows;
  try {
    const response=await fetcher(projectUrl+"/rest/v1/player_publications?"+params.toString(),{
      method:"GET",
      headers:{apikey:publishableKey,accept:"application/json","cache-control":"no-cache"},
      cache:"no-store",
      signal:AbortSignal.timeout(8000)
    });
    if(!response.ok) return {state:"unavailable",reason:"http_"+response.status};
    rows=await response.json();
  } catch {return {state:"unavailable",reason:"network_error"};}
  if(!Array.isArray(rows)) return {state:"invalid",reason:"response_not_array"};
  if(rows.length===0) return {state:"unpublished"};
  const row=rows[0], snapshot=row?.snapshot;
  const revision=Number(row?.revision);
  if(!Number.isSafeInteger(revision)||revision<=0||!isObject(snapshot)||
     snapshot.eventId!==eventId || snapshot.scheduleFingerprint!==scheduleFingerprint ||
     !Array.isArray(snapshot.fixtures)||snapshot.fixtures.length!==67 ||
     !isObject(snapshot.results)||!isObject(snapshot.roster) ||
     Object.keys(snapshot.roster).length!==30 ||
     typeof row.source_sha256!=="string"||!/^[a-f0-9]{64}$/.test(row.source_sha256))
    return {state:"invalid",reason:"inconsistent_snapshot"};
  try {
    const bytes=new TextEncoder().encode(JSON.stringify(snapshot));
    const checksum=hex(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)));
    if(checksum!==row.source_sha256) return {state:"invalid",reason:"digest_mismatch"};
  } catch {return {state:"invalid",reason:"digest_unavailable"};}
  if(!Number.isFinite(Date.parse(row.published_at)))
    return {state:"invalid",reason:"invalid_published_at"};
  return {state:"ready",revision,publishedAt:row.published_at,snapshot};
}

import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireText(text, needle, label) {
  if (!text.includes(needle)) {
    throw new Error(
      `VII-D5 verification failed: ${label}`,
    );
  }
}

function forbidText(text, needle, label) {
  if (text.includes(needle)) {
    throw new Error(
      `VII-D5 verification failed: ${label}`,
    );
  }
}

const worker = read(
  "supabase/functions/video-cleanup/index.ts",
);

const migration = read(
  "supabase/migrations/20260910113000_step_vii_d5_autonomous_video_cleanup.sql",
);

requireText(
  worker,
  "SUPABASE_SECRET_KEYS",
  "video cleanup must support modern Supabase backend secrets",
);

requireText(
  worker,
  "SUPABASE_SERVICE_ROLE_KEY",
  "video cleanup must retain legacy service-role compatibility",
);

requireText(
  worker,
  "x-auratio-cron-token",
  "video cleanup must accept the private cron token",
);

requireText(
  worker,
  "svc_video_cleanup_cron_token_valid",
  "cron-token authorization must remain server-authoritative",
);

requireText(
  worker,
  "svc_claim_video_deletion_jobs",
  "existing durable deletion claiming must be preserved",
);

requireText(
  worker,
  "svc_complete_video_deletion",
  "existing successful deletion finalization must be preserved",
);

requireText(
  worker,
  "svc_fail_video_deletion",
  "existing deletion retry semantics must be preserved",
);

requireText(
  migration,
  "private.video_cleanup_runtime_config",
  "private runtime configuration must exist",
);

requireText(
  migration,
  "svc_configure_video_cleanup_runtime",
  "environment-specific Edge URL configuration RPC must exist",
);

requireText(
  migration,
  "svc_video_cleanup_cron_token_valid",
  "cron token validator must exist",
);

requireText(
  migration,
  "private.video_cleanup_cron_tick",
  "cron tick function must exist",
);

requireText(
  migration,
  "net.http_post",
  "cron tick must invoke the Edge Function through pg_net",
);

requireText(
  migration,
  "'auratio-video-cleanup'",
  "named video-cleanup cron job must exist",
);

requireText(
  migration,
  "'* * * * *'",
  "video cleanup must be checked once per minute",
);

forbidText(
  migration,
  "dboyrlgzifpffnsznvde",
  "TEST project ref must not be hard-coded",
);

forbidText(
  migration,
  "czkbljnzcfsztfrwndsb",
  "production project ref must not be hard-coded",
);

console.log(
  "Step VII-D5 autonomous video cleanup verification PASS",
);

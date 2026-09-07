import 'dart:io';
import 'dart:ui' as ui;

import 'package:auratio_mobile/app/app.dart';
import 'package:auratio_mobile/app/router/app_router.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

bool _fontsLoaded = false;

Future<void> _loadFonts() async {
  if (_fontsLoaded) {
    return;
  }

  final interLoader = FontLoader(AuratioTypography.fontFamily)
    ..addFont(rootBundle.load('assets/fonts/InterVariable.ttf'));
  await interLoader.load();

  try {
    final whichFlutter = Process.runSync(
      Platform.isWindows ? 'where' : 'which',
      ['flutter'],
    );
    if (whichFlutter.exitCode == 0) {
      final flutterPath = (whichFlutter.stdout as String)
          .split(Platform.isWindows ? '\r\n' : '\n')
          .first
          .trim();
      final flutterDir = Directory(flutterPath).parent.parent;
      final candidates = [
        File(
          '${flutterDir.path}/bin/cache/artifacts/material_fonts/materialicons-regular.otf',
        ),
        File(
          '${flutterDir.path}/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf',
        ),
      ];
      for (final candidate in candidates) {
        if (candidate.existsSync()) {
          final bytes = candidate.readAsBytesSync();
          final iconLoader = FontLoader('MaterialIcons')
            ..addFont(Future.value(ByteData.view(bytes.buffer)));
          await iconLoader.load();
          break;
        }
      }
    }
  } catch (_) {}

  _fontsLoaded = true;
}

const _routes = <(String, String)>[
  ('M01_foundation', '/foundation'),
  ('M02_sign_in', '/auth/sign-in'),
  ('M03_create_account', '/auth/create-account'),
  ('M04_verify_email', '/auth/verify-email'),
  ('M05_email_verified', '/auth/email-verified'),
  ('M06_sign_in_new_account', '/auth/sign-in-new-account'),
  ('M07_forgot_password', '/auth/forgot-password'),
  ('M08_reset_link_sent', '/auth/reset-link-sent'),
  ('M09_reset_password', '/auth/reset-password'),
  ('M10_password_reset_complete', '/auth/password-reset-complete'),
  ('M11_onboarding_intro', '/onboarding/intro'),
  ('M12_choose_paths', '/onboarding/choose-paths'),
  ('M13_home', '/home'),
  ('M14_tracks', '/tracks'),
  ('M15_track_details', '/tracks/business-pitch-sales-pitch'),
  ('M16_submission_requirements', '/submissions/requirements'),
  ('M17_upload_recording', '/submissions/upload-recording'),
  ('M18_checking_recording', '/submissions/checking-recording'),
  ('M19_recording_accepted', '/submissions/recording-accepted'),
  ('M20_choose_evaluation_method', '/evaluations/choose-method'),
  ('M21_routing_ai', '/evaluations/routing/assigned-ai'),
  ('M22_routing_human', '/evaluations/routing/assigned-human'),
  ('M23_processing_ai', '/evaluations/processing/ai'),
  ('M24_processing_human', '/evaluations/processing/human'),
  ('M25_result_ai', '/evaluations/result/ai'),
  ('M26_result_human', '/evaluations/result/human'),
  ('M27_evaluation_report', '/evaluations/report'),
  ('M28_report_download_simulated', '/evaluations/report/download-simulated'),
  ('M29_pending_moderation', '/evaluations/status/pending-moderation'),
  ('M30_rejected', '/evaluations/status/rejected'),
  ('M31_progress', '/progress'),
  ('M32_approved_history', '/progress/approved-history'),
  ('M33_leaderboard_ai', '/leaderboard'),
  ('M34_leaderboard_human', '/leaderboard/human'),
  ('M35_events', '/events'),
  ('M36_event_details', '/events/details'),
  ('M37_profile', '/profile'),
  ('M38_profile_settings', '/profile/settings'),
  ('M39_manage_paths', '/profile/manage-paths'),
  ('M40_manage_paths_content_added', '/profile/manage-paths/content-added'),
  ('M41_profile_three_paths', '/profile/three-paths'),
];

Future<void> _writePng(
  WidgetTester tester,
  GlobalKey boundaryKey,
  String id,
) async {
  await tester.runAsync(() async {
    final boundary = boundaryKey.currentContext!.findRenderObject()
        as RenderRepaintBoundary;
    final image = await boundary.toImage(pixelRatio: 1);
    final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
    if (bytes == null) {
      throw StateError('Could not encode $id');
    }
    final dir = Directory('capture_output/final_reclose/mobile');
    dir.createSync(recursive: true);
    File('${dir.path}/$id.png').writeAsBytesSync(bytes.buffer.asUint8List());
  });
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('captures all 41 canonical mobile screens at 390x844', (tester) async {
    await _loadFonts();

    tester.view.devicePixelRatio = 1.0;
    tester.view.physicalSize = const Size(390, 844);
    addTearDown(() {
      tester.view.resetDevicePixelRatio();
      tester.view.resetPhysicalSize();
    });

    final out = Directory('capture_output/final_reclose/mobile');
    if (out.existsSync()) out.deleteSync(recursive: true);
    out.createSync(recursive: true);

    final container = ProviderContainer();
    addTearDown(container.dispose);
    final router = container.read(appRouterProvider);
    final boundaryKey = GlobalKey();

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: RepaintBoundary(
          key: boundaryKey,
          child: const AuratioApp(),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 250));

    for (final entry in _routes) {
      router.go(entry.$2);
      // Avoid pumpAndSettle: several canonical processing screens intentionally
      // contain indeterminate/animated UI.
      await tester.pump(const Duration(milliseconds: 500));

      expect(
        router.routeInformationProvider.value.uri.path,
        entry.$2,
        reason: '${entry.$1} unexpectedly redirected',
      );
      expect(find.byType(Scaffold), findsWidgets, reason: '${entry.$1} has no Scaffold');

      // A Flutter framework exception during layout/paint is a Step-IV blocker.
      final exception = tester.takeException();
      expect(exception, isNull, reason: '${entry.$1} threw during render');

      await _writePng(tester, boundaryKey, entry.$1);
    }

    final pngs = out
        .listSync()
        .whereType<File>()
        .where((f) => f.path.toLowerCase().endsWith('.png'))
        .toList();
    expect(pngs.length, 41);
  });

  testWidgets('adversarial unknown mobile entities redirect to safe list screens', (tester) async {
    await _loadFonts();

    tester.view.devicePixelRatio = 1.0;
    tester.view.physicalSize = const Size(390, 844);
    addTearDown(() {
      tester.view.resetDevicePixelRatio();
      tester.view.resetPhysicalSize();
    });

    final container = ProviderContainer();
    addTearDown(container.dispose);
    final router = container.read(appRouterProvider);

    await tester.pumpWidget(
      UncontrolledProviderScope(container: container, child: const AuratioApp()),
    );
    await tester.pump(const Duration(milliseconds: 200));

    router.go('/tracks/not-a-real-track');
    await tester.pump(const Duration(milliseconds: 350));
    expect(router.routeInformationProvider.value.uri.path, '/tracks');

    router.go('/events/not-a-real-event');
    await tester.pump(const Duration(milliseconds: 350));
    expect(router.routeInformationProvider.value.uri.path, '/events');

    router.go('/evaluations/result/ai?track=not-a-real-track');
    await tester.pump(const Duration(milliseconds: 350));
    expect(
      router.routeInformationProvider.value.uri.path,
      '/progress/approved-history',
    );
  });
}

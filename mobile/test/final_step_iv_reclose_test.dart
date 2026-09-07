import 'dart:io';
import 'dart:ui' as ui;

import 'package:auratio_mobile/app/app.dart';
import 'package:auratio_mobile/app/router/app_router.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:auratio_mobile/features/evaluations/application/evaluation_method_controller.dart';
import 'package:auratio_mobile/features/evaluations/domain/evaluation_method.dart';
import 'package:auratio_mobile/features/onboarding/application/path_selection_controller.dart';
import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
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

// Exact canonical mobile inventory preserved from the locked Step-IV 41-screen
// reconciliation: developer-only /foundation is NOT canonical, while Choose
// Evaluation has two canonical visible states (AI and Human).
const _routes = <(String, String)>[
  ('M01_sign_in', '/auth/sign-in'),
  ('M02_create_account', '/auth/create-account'),
  ('M03_verify_email', '/auth/verify-email'),
  ('M04_email_verified', '/auth/email-verified'),
  ('M05_onboarding_intro', '/onboarding/intro'),
  ('M06_choose_paths', '/onboarding/choose-paths'),
  ('M07_sign_in_new_account', '/auth/sign-in-new-account'),
  ('M08_forgot_password', '/auth/forgot-password'),
  ('M09_reset_link_sent', '/auth/reset-link-sent'),
  ('M10_reset_password', '/auth/reset-password'),
  ('M11_password_reset_complete', '/auth/password-reset-complete'),
  ('M12_home', '/home'),
  ('M13_tracks', '/tracks'),
  ('M14_track_details', '/tracks/business-pitch-sales-pitch'),
  ('M15_submission_requirements', '/submissions/requirements'),
  ('M16_upload_recording', '/submissions/upload-recording'),
  ('M17_checking_recording', '/submissions/checking-recording'),
  ('M18_recording_accepted', '/submissions/recording-accepted'),
  ('M19_choose_evaluation_ai', '/evaluations/choose-method'),
  ('M20_choose_evaluation_human', '/evaluations/choose-method?method=human'),
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

    final twoPathState = <AuratioPath>{
      AuratioPath.publicSpeaking,
      AuratioPath.professionalPresenting,
    };
    final threePathState = <AuratioPath>{
      ...twoPathState,
      AuratioPath.contentCreation,
    };

    for (final entry in _routes) {
      // The two canonical Path-management states are stateful screens, not just
      // different locations. Seed the same unified provider used by the real UI
      // so M39/M40/M41 render their intended canonical state deterministically.
      if (entry.$1 == 'M19_choose_evaluation_ai') {
        container
            .read(evaluationMethodSelectionProvider.notifier)
            .select(EvaluationMethod.ai);
      } else if (entry.$1 == 'M20_choose_evaluation_human') {
        // M19 and M20 intentionally share the same GoRoute path. GoRouter may
        // preserve the existing State object when only the query changes, so
        // initState() is not a reliable way to switch this consecutive capture.
        // Seed the same real provider the cards use before navigation.
        container
            .read(evaluationMethodSelectionProvider.notifier)
            .select(EvaluationMethod.human);
      }

      if (entry.$1 == 'M39_manage_paths') {
        container.read(selectedPathsProvider.notifier).setPaths(twoPathState);
      } else if (entry.$1 == 'M40_manage_paths_content_added' ||
          entry.$1 == 'M41_profile_three_paths') {
        container.read(selectedPathsProvider.notifier).setPaths(threePathState);
      }

      router.go(entry.$2);

      // First pump applies the GoRouter location/page change. The second pump
      // advances Auratio's 150 ms dissolve transition past completion. The final
      // pump flushes post-build microtasks/provider updates (notably the Human
      // Choose Evaluation initial selection). We intentionally do NOT use
      // pumpAndSettle because canonical Processing screens animate indefinitely.
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 250));
      await tester.pump();

      expect(
        router.routeInformationProvider.value.uri.path,
        Uri.parse(entry.$2).path,
        reason: '${entry.$1} unexpectedly redirected',
      );
      expect(find.byType(Scaffold), findsWidgets, reason: '${entry.$1} has no Scaffold');

      // Sentinel assertions prove the capture is the requested canonical screen,
      // rather than a still-visible outgoing page from a transition.
      switch (entry.$1) {
        case 'M15_submission_requirements':
          expect(find.text('Before you upload'), findsOneWidget);
        case 'M16_upload_recording':
          expect(find.text('Choose an .mp4 recording'), findsOneWidget);
        case 'M17_checking_recording':
          expect(find.text('Checking eligibility'), findsOneWidget);
        case 'M18_recording_accepted':
          expect(find.text('Recording is eligible'), findsOneWidget);
        case 'M19_choose_evaluation_ai':
          expect(find.text('Continue with AI Evaluation'), findsOneWidget);
        case 'M20_choose_evaluation_human':
          expect(find.text('Continue with Human Evaluation'), findsOneWidget);
        case 'M21_routing_ai':
          expect(find.text('Assigned to AI Evaluation'), findsOneWidget);
        case 'M22_routing_human':
          expect(find.text('Assigned to Human Evaluation'), findsOneWidget);
        case 'M29_pending_moderation':
          expect(
            find.text('Review is required before publication'),
            findsOneWidget,
          );
        case 'M30_rejected':
          expect(find.text('Evaluation rejected'), findsOneWidget);
        case 'M31_progress':
          expect(find.text('Your Private Progress'), findsOneWidget);
        case 'M35_events':
          expect(find.text('Events for you'), findsOneWidget);
        case 'M36_event_details':
          expect(find.text('Public Speaking Summit'), findsOneWidget);
        case 'M37_profile':
          expect(find.text('Alex Morgan'), findsOneWidget);
        case 'M38_profile_settings':
          expect(find.text('Account & app settings'), findsOneWidget);
        case 'M40_manage_paths_content_added':
          expect(
            container.read(selectedPathsProvider),
            contains(AuratioPath.contentCreation),
          );
        case 'M41_profile_three_paths':
          expect(
            find.text('Content Creation  •  Manage Paths  →'),
            findsOneWidget,
          );
      }

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

    // A consecutive byte-identical pair is impossible in the locked canonical
    // inventory and is a strong signal that an outgoing route was captured.
    for (var i = 1; i < _routes.length; i++) {
      final previous = File(
        '${out.path}/${_routes[i - 1].$1}.png',
      ).readAsBytesSync();
      final current = File(
        '${out.path}/${_routes[i].$1}.png',
      ).readAsBytesSync();
      expect(
        current,
        isNot(equals(previous)),
        reason:
            '${_routes[i - 1].$1} and ${_routes[i].$1} rendered byte-identical captures',
      );
    }
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

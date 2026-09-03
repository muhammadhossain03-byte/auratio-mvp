import 'dart:io';
import 'dart:ui' as ui;

import 'package:auratio_mobile/app/app.dart';
import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/onboarding/application/path_selection_controller.dart';
import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_brand_lockup.dart';
import 'package:auratio_mobile/features/tracks/application/selected_track_provider.dart';
import 'package:auratio_mobile/features/tracks/domain/track_catalog.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

bool _fontsLoaded = false;

Future<void> _loadFonts() async {
  if (_fontsLoaded) {
    return;
  }

  // Load Inter font
  final interLoader = FontLoader(AuratioTypography.fontFamily)
    ..addFont(rootBundle.load('assets/fonts/InterVariable.ttf'));
  await interLoader.load();

  // Load MaterialIcons font
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

void main() {
  final outputDir = Directory('${Directory.current.path}/capture_output').path;

  setUpAll(() {
    Directory(outputDir).createSync(recursive: true);
  });

  for (final item in [
    ('sign_in', AppRoutePaths.signIn),
    ('create_account', AppRoutePaths.createAccount),
    ('verify_email', AppRoutePaths.verifyEmail),
    ('email_verified', AppRoutePaths.emailVerified),
    ('sign_in_new_account', AppRoutePaths.signInNewAccount),
    ('forgot_password', AppRoutePaths.forgotPassword),
    ('reset_link_sent', AppRoutePaths.resetLinkSent),
    ('reset_password', AppRoutePaths.resetPassword),
    ('password_reset_complete', AppRoutePaths.passwordResetComplete),
    ('onboarding_intro', AppRoutePaths.onboardingIntro),
    ('choose_paths', AppRoutePaths.choosePaths),
    ('home', AppRoutePaths.home),
    ('tracks', AppRoutePaths.tracks),
    ('track_details', AppRoutePaths.trackDetails),
    ('track_details_informative', '/tracks/informative'),
    ('track_details_marketing', '/tracks/marketing-promotional'),
    ('submission_requirements', AppRoutePaths.submissionRequirements),
    ('upload_recording', AppRoutePaths.uploadRecording),
    ('upload_recording_informative', AppRoutePaths.uploadRecording),
    ('checking_recording', AppRoutePaths.checkingRecording),
    ('recording_accepted', AppRoutePaths.recordingAccepted),
    ('recording_accepted_informative', AppRoutePaths.recordingAccepted),
    ('choose_evaluation_ai', AppRoutePaths.chooseEvaluationMethod),
    (
      'choose_evaluation_human',
      '${AppRoutePaths.chooseEvaluationMethod}?method=human',
    ),
    ('routing_assigned_ai', AppRoutePaths.routingAssignedAi),
    ('routing_assigned_human', AppRoutePaths.routingAssignedHuman),
    ('evaluation_processing_ai', AppRoutePaths.evaluationProcessingAi),
    ('evaluation_processing_human', AppRoutePaths.evaluationProcessingHuman),
    ('evaluation_result_ai', AppRoutePaths.evaluationResultAi),
    ('evaluation_result_ai_informative', AppRoutePaths.evaluationResultAi),
    ('evaluation_result_human', AppRoutePaths.evaluationResultHuman),
    (
      'evaluation_result_human_informative',
      AppRoutePaths.evaluationResultHuman,
    ),
    ('evaluation_report', AppRoutePaths.evaluationReport),
    (
      'evaluation_report_download_simulated',
      AppRoutePaths.evaluationReportDownloadSimulated,
    ),
    ('pending_moderation', AppRoutePaths.evaluationStatusPendingModeration),
    ('evaluation_rejected', AppRoutePaths.evaluationStatusRejected),
    ('private_progress', AppRoutePaths.progress),
    ('approved_evaluation_history', AppRoutePaths.approvedEvaluationHistory),
    ('leaderboard_ai_all_time', AppRoutePaths.leaderboard),
    ('leaderboard_human_all_time', AppRoutePaths.leaderboardHuman),
    ('events_discovery', AppRoutePaths.events),
    ('event_details', AppRoutePaths.eventDetails),
    ('profile', AppRoutePaths.profile),
    ('settings', AppRoutePaths.profileSettings),
    ('manage_paths', AppRoutePaths.managePaths),
    ('manage_paths_content_added', AppRoutePaths.managePathsContentAdded),
    ('profile_three_paths', AppRoutePaths.profileThreePaths),
  ]) {
    testWidgets('generate capture for ${item.$1}', (tester) async {
      await _loadFonts();

      tester.view
        ..devicePixelRatio = 1.0
        ..physicalSize = const Size(390, 844);
      addTearDown(tester.view.reset);

      const captureKey = Key('capture-boundary');

      await tester.pumpWidget(
        ProviderScope(
          child: RepaintBoundary(key: captureKey, child: const AuratioApp()),
        ),
      );
      await tester.pumpAndSettle();

      final app = tester.widget<MaterialApp>(find.byType(MaterialApp));
      final router = app.routerConfig! as GoRouter;

      final container = ProviderScope.containerOf(
        tester.element(find.byType(MaterialApp)),
      );
      if (item.$1 == 'manage_paths_content_added' ||
          item.$1 == 'profile_three_paths') {
        container
            .read(selectedPathsProvider.notifier)
            .setPaths(AuratioPath.values.toSet());
      }

      if (item.$1.contains('informative')) {
        container
            .read(selectedTrackProvider.notifier)
            .select(AuratioTrackCatalog.informative);
      } else if (item.$1.contains('marketing')) {
        container
            .read(selectedTrackProvider.notifier)
            .select(AuratioTrackCatalog.marketingPromotional);
      } else {
        container
            .read(selectedTrackProvider.notifier)
            .select(AuratioTrackCatalog.businessPitch);
      }

      router.go(item.$2);
      if (item.$1 == 'pending_moderation' ||
          item.$1 == 'verify_email' ||
          item.$1 == 'reset_link_sent') {
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));
        await tester.pump();
      } else {
        await tester.pumpAndSettle();
      }

      // Precache logo image if screen uses AuratioBrandLockup
      if (item.$1 == 'home' ||
          item.$1 == 'sign_in' ||
          item.$1 == 'sign_in_new_account' ||
          item.$1 == 'onboarding_intro') {
        await tester.runAsync(() async {
          final element = tester.element(find.byType(AuratioApp));
          await precacheImage(
            const AssetImage(AuratioBrandLockup.assetPath),
            element,
          );
        });
        await tester.pumpAndSettle();
      }

      await tester.runAsync(() async {
        final boundary = tester.renderObject<RenderRepaintBoundary>(
          find.byKey(captureKey),
        );
        final image = await boundary.toImage(pixelRatio: 1.0);
        final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
        final bytes = byteData!.buffer.asUint8List();

        File('$outputDir/flutter_${item.$1}.png').writeAsBytesSync(bytes);
      });
    });
  }
}

import 'dart:io';
import 'dart:ui' as ui;

import 'package:auratio_mobile/app/app.dart';
import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_brand_lockup.dart';
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
    ('home', AppRoutePaths.home),
    ('tracks', AppRoutePaths.tracks),
    ('track_details', AppRoutePaths.trackDetails),
    ('submission_requirements', AppRoutePaths.submissionRequirements),
    ('upload_recording', AppRoutePaths.uploadRecording),
    ('checking_recording', AppRoutePaths.checkingRecording),
    ('recording_accepted', AppRoutePaths.recordingAccepted),
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
    ('evaluation_result_human', AppRoutePaths.evaluationResultHuman),
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

      router.go(item.$2);
      if (item.$1 == 'pending_moderation') {
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 200));
        await tester.pump();
      } else {
        await tester.pumpAndSettle();
      }

      // Precache logo image if on home screen
      if (item.$1 == 'home') {
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

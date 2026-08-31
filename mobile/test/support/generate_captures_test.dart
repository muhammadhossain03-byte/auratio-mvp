import 'dart:io';
import 'dart:ui' as ui;

import 'package:auratio_mobile/app/app.dart';
import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

bool _interFontLoaded = false;

Future<void> _loadInterFont() async {
  if (_interFontLoaded) {
    return;
  }
  final loader = FontLoader(AuratioTypography.fontFamily)
    ..addFont(rootBundle.load('assets/fonts/InterVariable.ttf'));
  await loader.load();
  _interFontLoaded = true;
}

void main() {
  const outputDir = 'd:/auratio-mvp/mobile/capture_output';

  setUpAll(() {
    Directory(outputDir).createSync(recursive: true);
  });

  for (final item in [
    ('home', AppRoutePaths.home),
    ('tracks', AppRoutePaths.tracks),
    ('track_details', AppRoutePaths.trackDetails),
    ('submission_requirements', AppRoutePaths.submissionRequirements),
  ]) {
    testWidgets('generate capture for ${item.$1}', (tester) async {
      await _loadInterFont();

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
      await tester.pump(const Duration(milliseconds: 50));

      final app = tester.widget<MaterialApp>(find.byType(MaterialApp));
      final router = app.routerConfig! as GoRouter;

      router.go(item.$2);
      await tester.pump(const Duration(milliseconds: 100));

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

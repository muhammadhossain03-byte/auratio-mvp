import 'package:auratio_mobile/app/app.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

const auratioTestCanvas = Size(
  AuratioSizing.mobileCanvasWidth,
  AuratioSizing.mobileCanvasHeight,
);

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

Future<GoRouter> pumpAuratioApp(WidgetTester tester) async {
  await _loadInterFont();

  tester.view
    ..devicePixelRatio = 1
    ..physicalSize = auratioTestCanvas;
  addTearDown(tester.view.reset);

  await tester.pumpWidget(const ProviderScope(child: AuratioApp()));
  await tester.pump();

  final app = tester.widget<MaterialApp>(find.byType(MaterialApp));
  return app.routerConfig! as GoRouter;
}

Future<void> openAuratioRoute(
  WidgetTester tester,
  GoRouter router,
  String location, {
  bool settle = true,
}) async {
  router.go(location);
  await tester.pump();
  if (settle) {
    await tester.pumpAndSettle();
  }
}

void expectInsideTestCanvas(WidgetTester tester, Finder finder) {
  expect(finder, findsOneWidget);

  final rect = tester.getRect(finder);
  final canvas = Offset.zero & auratioTestCanvas;
  expect(
    canvas.intersect(rect),
    rect,
    reason: 'Target widget must remain fully visible at 390 x 844.',
  );
}

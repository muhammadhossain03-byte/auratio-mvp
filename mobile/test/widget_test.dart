import 'package:auratio_mobile/app/app.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:auratio_mobile/foundation/navigation/auratio_navigation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('bundles the Inter variable font', () async {
    final font = await rootBundle.load('assets/fonts/InterVariable.ttf');

    expect(font.lengthInBytes, greaterThan(0));
  });

  testWidgets('renders the routed application foundation', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: AuratioApp()));

    expect(find.byType(MaterialApp), findsOneWidget);
    expect(find.byType(Scaffold), findsOneWidget);

    final app = tester.widget<MaterialApp>(find.byType(MaterialApp));
    expect(
      app.theme?.textTheme.bodyMedium?.fontFamily,
      AuratioTypography.fontFamily,
    );
    expect(app.theme?.scaffoldBackgroundColor, AuratioColors.backgroundApp);
  });

  testWidgets('renders locked publication status labels', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Wrap(
            children: [
              AuratioStatusBadge(status: AuratioStatus.processing),
              AuratioStatusBadge(status: AuratioStatus.pending),
              AuratioStatusBadge(status: AuratioStatus.approved),
              AuratioStatusBadge(status: AuratioStatus.rejected),
            ],
          ),
        ),
      ),
    );

    for (final label in ['Processing', 'Pending', 'Approved', 'Rejected']) {
      expect(find.text(label), findsOneWidget);
    }
  });

  testWidgets('mobile navigation reports destination selection', (
    tester,
  ) async {
    var selectedIndex = -1;
    const destinations = [
      AuratioMobileDestination(label: 'One', icon: Icon(Icons.circle)),
      AuratioMobileDestination(label: 'Two', icon: Icon(Icons.circle)),
    ];

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          bottomNavigationBar: AuratioMobileNavigationBar(
            destinations: destinations,
            currentIndex: 0,
            onDestinationSelected: (index) => selectedIndex = index,
          ),
        ),
      ),
    );

    await tester.tap(find.text('Two'));
    expect(selectedIndex, 1);
  });

  testWidgets('small interactive primitives meet the minimum target', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              AuratioButton(
                label: 'Action',
                size: AuratioButtonSize.small,
                onPressed: () {},
              ),
              AuratioChipTab(label: 'A', selected: false, onPressed: () {}),
            ],
          ),
        ),
      ),
    );

    expect(
      tester.getSize(find.byType(AuratioButton)).height,
      greaterThanOrEqualTo(AuratioSizing.minimumTouchTarget),
    );
    expect(
      tester.getSize(find.byType(AuratioChipTab)).height,
      greaterThanOrEqualTo(AuratioSizing.minimumTouchTarget),
    );
    expect(
      tester.getSize(find.byType(AuratioChipTab)).width,
      greaterThanOrEqualTo(AuratioSizing.minimumTouchTarget),
    );
  });

  testWidgets('validator errors and helper text use distinct semantic colors', (
    tester,
  ) async {
    final formKey = GlobalKey<FormState>();

    await tester.pumpWidget(
      MaterialApp(
        theme: AuratioTheme.light,
        home: Scaffold(
          body: Form(
            key: formKey,
            child: AuratioInput(
              label: 'Email',
              helperText: 'Use your account email',
              validator: (_) => 'Email is required',
            ),
          ),
        ),
      ),
    );

    final helper = tester.widget<Text>(find.text('Use your account email'));
    expect(helper.style?.color, AuratioColors.textTertiary);

    formKey.currentState!.validate();
    await tester.pump();

    final error = tester.widget<Text>(find.text('Email is required'));
    expect(error.style?.color, AuratioColors.statusRejectedForeground);
  });

  testWidgets('mobile navigation extends through bottom system insets', (
    tester,
  ) async {
    const bottomInset = 34.0;

    await tester.pumpWidget(
      MaterialApp(
        home: MediaQuery(
          data: const MediaQueryData(
            viewPadding: EdgeInsets.only(bottom: bottomInset),
          ),
          child: Scaffold(
            bottomNavigationBar: AuratioMobileNavigationBar(
              destinations: const [
                AuratioMobileDestination(
                  label: 'One',
                  icon: Icon(Icons.circle),
                ),
                AuratioMobileDestination(
                  label: 'Two',
                  icon: Icon(Icons.circle),
                ),
              ],
              currentIndex: 0,
              onDestinationSelected: _ignoreSelection,
            ),
          ),
        ),
      ),
    );

    expect(
      tester.getSize(find.byType(AuratioMobileNavigationBar)).height,
      AuratioMobileNavigationLayout.barHeight + bottomInset,
    );
  });

  testWidgets('disabled variants expose consistent visual states', (
    tester,
  ) async {
    final semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              AuratioButton(
                label: 'Unavailable',
                variant: AuratioButtonVariant.secondary,
                onPressed: null,
              ),
              AuratioChipTab(label: 'Unavailable', selected: false),
            ],
          ),
        ),
      ),
    );

    final button = tester.widget<TextButton>(find.byType(TextButton));
    expect(
      button.style?.side?.resolve({WidgetState.disabled})?.color,
      AuratioColors.borderDefault,
    );

    final opacity = tester.widget<Opacity>(
      find.descendant(
        of: find.byType(AuratioChipTab),
        matching: find.byType(Opacity),
      ),
    );
    expect(opacity.opacity, AuratioOpacity.disabled);
    expect(
      tester.getSemantics(find.byType(AuratioChipTab)),
      isSemantics(
        label: 'Unavailable',
        isButton: true,
        hasEnabledState: true,
        isEnabled: false,
        hasSelectedState: true,
        isSelected: false,
        hasTapAction: false,
      ),
    );
    semantics.dispose();
  });
}

void _ignoreSelection(int _) {}

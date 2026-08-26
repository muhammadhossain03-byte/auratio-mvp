import 'package:auratio_mobile/app/app.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:auratio_mobile/foundation/navigation/auratio_navigation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
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
}

import 'package:flutter/material.dart';

import 'auratio_mobile_navigation.dart';

class AuratioMobileShell extends StatelessWidget {
  const AuratioMobileShell({
    required this.body,
    required this.destinations,
    required this.currentIndex,
    required this.onDestinationSelected,
    this.header,
    super.key,
  });

  final Widget body;
  final Widget? header;
  final List<AuratioMobileDestination> destinations;
  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          ?header,
          Expanded(child: body),
        ],
      ),
      bottomNavigationBar: AuratioMobileNavigationBar(
        destinations: destinations,
        currentIndex: currentIndex,
        onDestinationSelected: onDestinationSelected,
      ),
    );
  }
}

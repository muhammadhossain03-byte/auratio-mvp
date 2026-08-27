import 'package:flutter/material.dart';

class AuratioBrandLockup extends StatelessWidget {
  const AuratioBrandLockup({required this.width, super.key});

  static const assetPath = 'assets/images/auratio_full_lockup.png';
  static const _aspectRatio = 302 / 89;

  final double width;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      assetPath,
      width: width,
      height: width / _aspectRatio,
      fit: BoxFit.contain,
      semanticLabel: 'Auratio — Where Greats Orate',
    );
  }
}

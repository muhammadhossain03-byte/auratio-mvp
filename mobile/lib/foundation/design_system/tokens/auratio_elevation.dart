import 'package:flutter/material.dart';

abstract final class AuratioElevation {
  static const level100 = <BoxShadow>[
    BoxShadow(color: Color(0x0F041B3B), offset: Offset(0, 1), blurRadius: 3),
  ];

  static const level200 = <BoxShadow>[
    BoxShadow(
      color: Color(0x14041B3B),
      offset: Offset(0, 4),
      blurRadius: 12,
      spreadRadius: -2,
    ),
  ];

  static const level300 = <BoxShadow>[
    BoxShadow(
      color: Color(0x1F041B3B),
      offset: Offset(0, 12),
      blurRadius: 32,
      spreadRadius: -6,
    ),
  ];
}

import 'package:flutter/material.dart';

abstract final class AuratioColors {
  // Color primitives
  static const brandNavy950 = Color(0xFF021226);
  static const brandNavy900 = Color(0xFF041B3B);
  static const brandNavy800 = Color(0xFF08274D);
  static const brandNavy700 = Color(0xFF0A315E);

  static const brandBlue50 = Color(0xFFF3F8FE);
  static const brandBlue100 = Color(0xFFE6F0FA);
  static const brandBlue200 = Color(0xFFB2CAEB);
  static const brandBlue300 = Color(0xFF8FBFE8);
  static const brandBlue500 = Color(0xFF53A6E6);
  static const brandBlue600 = Color(0xFF348BCB);
  static const brandBlue700 = Color(0xFF256EA5);

  static const neutralWhite = Color(0xFFFFFFFF);
  static const neutral25 = Color(0xFFFCFDFE);
  static const neutral50 = Color(0xFFF7F9FC);
  static const neutral100 = Color(0xFFEEF2F7);
  static const neutral200 = Color(0xFFDCE3ED);
  static const neutral300 = Color(0xFFC8D2E0);
  static const neutral400 = Color(0xFF98A6B9);
  static const neutral500 = Color(0xFF6B788A);
  static const neutral600 = Color(0xFF4E5968);
  static const neutral700 = Color(0xFF374151);
  static const neutral800 = Color(0xFF1F2937);
  static const neutral900 = Color(0xFF111827);
  static const neutral950 = Color(0xFF0A0F1A);

  static const green50 = Color(0xFFEAF7F0);
  static const green500 = Color(0xFF2F9E68);
  static const green700 = Color(0xFF1F6B48);
  static const amber50 = Color(0xFFFFF7E8);
  static const amber500 = Color(0xFFD98B1F);
  static const amber700 = Color(0xFF925F12);
  static const red50 = Color(0xFFFFF0F0);
  static const red500 = Color(0xFFD94B4B);
  static const red700 = Color(0xFF9E3232);

  // Color semantics
  static const backgroundApp = neutral25;
  static const backgroundBrand = brandNavy900;
  static const backgroundInverse = neutral950;
  static const surfaceDefault = neutralWhite;
  static const surfaceSubtle = neutral50;
  static const surfaceRaised = neutralWhite;
  static const surfaceBrandSoft = brandBlue50;
  static const surfaceDisabled = neutral100;

  static const textPrimary = neutral900;
  static const textSecondary = neutral600;
  static const textTertiary = neutral500;
  static const textOnBrand = neutralWhite;
  static const textLink = brandBlue700;

  static const borderDefault = neutral200;
  static const borderStrong = neutral300;
  static const borderFocus = brandBlue500;
  static const borderError = red500;

  static const actionPrimaryBackground = brandNavy900;
  static const actionPrimaryForeground = neutralWhite;
  static const actionSecondaryBackground = neutralWhite;
  static const actionSecondaryForeground = brandNavy900;
  static const actionAccentBackground = brandBlue500;
  static const actionAccentForeground = brandNavy900;
  static const actionDisabledBackground = neutral100;
  static const actionDisabledForeground = neutral400;

  static const statusProcessingBackground = brandBlue50;
  static const statusProcessingForeground = brandNavy800;
  static const statusPendingBackground = amber50;
  static const statusPendingForeground = amber700;
  static const statusApprovedBackground = green50;
  static const statusApprovedForeground = green700;
  static const statusRejectedBackground = red50;
  static const statusRejectedForeground = red700;

  static const iconDefault = neutral700;
  static const iconMuted = neutral400;
  static const iconBrand = brandBlue500;
}

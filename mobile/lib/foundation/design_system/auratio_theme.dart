import 'package:flutter/material.dart';

import 'tokens/auratio_colors.dart';
import 'tokens/auratio_metrics.dart';
import 'tokens/auratio_typography.dart';

abstract final class AuratioTheme {
  static ThemeData get light {
    const colorScheme = ColorScheme.light(
      primary: AuratioColors.actionPrimaryBackground,
      onPrimary: AuratioColors.actionPrimaryForeground,
      secondary: AuratioColors.actionAccentBackground,
      onSecondary: AuratioColors.actionAccentForeground,
      error: AuratioColors.red500,
      onError: AuratioColors.neutralWhite,
      surface: AuratioColors.surfaceDefault,
      onSurface: AuratioColors.textPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AuratioColors.backgroundApp,
      fontFamily: AuratioTypography.fontFamily,
      textTheme: AuratioTypography.textTheme.apply(
        bodyColor: AuratioColors.textPrimary,
        displayColor: AuratioColors.textPrimary,
      ),
      dividerColor: AuratioColors.borderDefault,
      disabledColor: AuratioColors.actionDisabledForeground,
      focusColor: AuratioColors.borderFocus,
      appBarTheme: const AppBarTheme(
        backgroundColor: AuratioColors.surfaceDefault,
        foregroundColor: AuratioColors.textPrimary,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AuratioColors.surfaceDefault,
        contentPadding: const EdgeInsets.all(AuratioSpacing.md + 2),
        hintStyle: AuratioTypography.bodyMedium.copyWith(
          color: AuratioColors.textTertiary,
        ),
        border: _border(AuratioColors.borderDefault),
        enabledBorder: _border(AuratioColors.borderDefault),
        focusedBorder: _border(
          AuratioColors.borderFocus,
          width: AuratioBorders.emphasized,
        ),
        errorBorder: _border(AuratioColors.borderError),
        focusedErrorBorder: _border(
          AuratioColors.borderError,
          width: AuratioBorders.emphasized,
        ),
        disabledBorder: _border(AuratioColors.borderDefault),
      ),
      splashFactory: InkSparkle.splashFactory,
      visualDensity: VisualDensity.standard,
    );
  }

  static OutlineInputBorder _border(Color color, {double width = 1}) {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(AuratioRadii.md),
      borderSide: BorderSide(color: color, width: width),
    );
  }
}

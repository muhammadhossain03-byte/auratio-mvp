import 'package:flutter/material.dart';

import '../tokens/auratio_colors.dart';
import '../tokens/auratio_metrics.dart';
import '../tokens/auratio_typography.dart';

class AuratioInput extends StatelessWidget {
  const AuratioInput({
    required this.label,
    this.controller,
    this.focusNode,
    this.placeholder,
    this.helperText,
    this.errorText,
    this.enabled = true,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.onChanged,
    this.validator,
    this.prefix,
    this.suffix,
    this.controlHeight = AuratioSizing.controlMedium,
    this.labelGap = 6,
    this.labelStyle,
    this.scrollPadding = const EdgeInsets.all(AuratioSpacing.xl),
    super.key,
  });

  final String label;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final String? placeholder;
  final String? helperText;
  final String? errorText;
  final bool enabled;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool obscureText;
  final ValueChanged<String>? onChanged;
  final FormFieldValidator<String>? validator;
  final Widget? prefix;
  final Widget? suffix;
  final double controlHeight;
  final double labelGap;
  final TextStyle? labelStyle;
  final EdgeInsets scrollPadding;

  @override
  Widget build(BuildContext context) {
    final helperStyle = AuratioTypography.caption.copyWith(
      color: AuratioColors.textTertiary,
    );
    final errorStyle = AuratioTypography.caption.copyWith(
      color: AuratioColors.statusRejectedForeground,
    );

    return Semantics(
      textField: true,
      label: label,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            label,
            style:
                labelStyle ??
                AuratioTypography.labelMedium.copyWith(
                  color: enabled
                      ? AuratioColors.textPrimary
                      : AuratioColors.textTertiary,
                ),
          ),
          SizedBox(height: labelGap),
          TextFormField(
            controller: controller,
            focusNode: focusNode,
            enabled: enabled,
            keyboardType: keyboardType,
            textInputAction: textInputAction,
            obscureText: obscureText,
            scrollPadding: scrollPadding,
            onChanged: onChanged,
            validator: validator,
            style: AuratioTypography.bodyMedium.copyWith(
              color: enabled
                  ? AuratioColors.textPrimary
                  : AuratioColors.textTertiary,
            ),
            decoration: InputDecoration(
              hintText: placeholder,
              helperText: errorText == null ? helperText : null,
              helperStyle: helperStyle,
              errorText: errorText,
              errorStyle: errorStyle,
              prefixIcon: prefix,
              suffixIcon: suffix,
              fillColor: enabled
                  ? AuratioColors.surfaceDefault
                  : AuratioColors.surfaceDisabled,
              constraints: BoxConstraints(minHeight: controlHeight),
            ),
          ),
        ],
      ),
    );
  }
}

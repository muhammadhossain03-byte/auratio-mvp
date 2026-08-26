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

  @override
  Widget build(BuildContext context) {
    final supportingStyle = AuratioTypography.caption.copyWith(
      color: errorText == null
          ? AuratioColors.textTertiary
          : AuratioColors.red700,
    );

    return Semantics(
      textField: true,
      label: label,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            label,
            style: AuratioTypography.labelMedium.copyWith(
              color: enabled
                  ? AuratioColors.textPrimary
                  : AuratioColors.textTertiary,
            ),
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: controller,
            focusNode: focusNode,
            enabled: enabled,
            keyboardType: keyboardType,
            textInputAction: textInputAction,
            obscureText: obscureText,
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
              helperStyle: supportingStyle,
              errorText: errorText,
              errorStyle: supportingStyle,
              prefixIcon: prefix,
              suffixIcon: suffix,
              fillColor: enabled
                  ? AuratioColors.surfaceDefault
                  : AuratioColors.surfaceDisabled,
              constraints: const BoxConstraints(
                minHeight: AuratioSizing.controlMedium,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../application/path_selection_controller.dart';
import '../../domain/auratio_path.dart';
import '../onboarding_keys.dart';

class ChoosePathsScreen extends ConsumerStatefulWidget {
  const ChoosePathsScreen({
    this.initialPaths,
    this.onPersistedContinue,
    super.key,
  });

  final Set<AuratioPath>? initialPaths;
  final Future<void> Function(Set<AuratioPath>)? onPersistedContinue;

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  ConsumerState<ChoosePathsScreen> createState() => _ChoosePathsScreenState();
}

class _ChoosePathsScreenState extends ConsumerState<ChoosePathsScreen> {
  Set<AuratioPath>? _persistedSelection;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialPaths != null) {
      _persistedSelection = Set<AuratioPath>.from(widget.initialPaths!);
    }
  }

  void _togglePersisted(AuratioPath path) {
    final current = _persistedSelection;
    if (current == null) return;

    setState(() {
      final next = Set<AuratioPath>.from(current);
      if (!next.add(path)) {
        next.remove(path);
      }
      _persistedSelection = next;
    });
  }

  Future<void> _continue(Set<AuratioPath> selectedPaths) async {
    if (selectedPaths.isEmpty || _saving) return;

    final persistedContinue = widget.onPersistedContinue;
    if (persistedContinue == null) {
      context.go(AppRoutePaths.home);
      return;
    }

    setState(() => _saving = true);
    try {
      await persistedContinue(Set.unmodifiable(selectedPaths));
      if (!mounted) return;
      context.go(AppRoutePaths.home);
    } catch (error) {
      if (!mounted) return;
      final text = error.toString();
      final separator = text.indexOf(': ');
      final message = separator >= 0 ? text.substring(separator + 2) : text;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final persistedSelection = _persistedSelection;
    final Set<AuratioPath> selectedPaths =
        persistedSelection ??
        ref.watch<Set<AuratioPath>>(selectedPathsProvider);
    final controller = ref.read(selectedPathsProvider.notifier);
    final ValueChanged<AuratioPath> onToggle = persistedSelection == null
        ? controller.toggle
        : _togglePersisted;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: OnboardingKeys.choosePathsScreen,
      value: ChoosePathsScreen._overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Choose Your Path',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.onboardingIntro),
              ),
              Expanded(
                child: Stack(
                  children: [
                    Positioned(
                      left: AuratioSpacing.xl,
                      right: AuratioSpacing.xl,
                      top: 26,
                      child: Text(
                        'Select one or more areas to focus on.',
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                        ),
                      ),
                    ),
                    _positionedPathCard(
                      top: 74,
                      path: AuratioPath.publicSpeaking,
                      selectedPaths: selectedPaths,
                      onTap: onToggle,
                    ),
                    _positionedPathCard(
                      top: 202,
                      path: AuratioPath.professionalPresenting,
                      selectedPaths: selectedPaths,
                      onTap: onToggle,
                    ),
                    _positionedPathCard(
                      top: 330,
                      path: AuratioPath.contentCreation,
                      selectedPaths: selectedPaths,
                      onTap: onToggle,
                    ),
                    const Positioned(
                      left: AuratioSpacing.xl,
                      right: AuratioSpacing.xl,
                      top: 478,
                      height: 88,
                      child: _PathGuidanceCard(),
                    ),
                    Positioned(
                      left: AuratioSpacing.xl,
                      right: AuratioSpacing.xl,
                      bottom: 46,
                      child: AuratioButton(
                        key: OnboardingKeys.continueButton,
                        label: 'Continue',
                        onPressed: selectedPaths.isEmpty || _saving
                            ? null
                            : () => _continue(selectedPaths),
                        expand: true,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static Positioned _positionedPathCard({
    required double top,
    required AuratioPath path,
    required Set<AuratioPath> selectedPaths,
    required ValueChanged<AuratioPath> onTap,
  }) {
    return Positioned(
      left: AuratioSpacing.xl,
      right: AuratioSpacing.xl,
      top: top,
      height: 104,
      child: _PathCard(
        path: path,
        selected: selectedPaths.contains(path),
        onTap: () => onTap(path),
      ),
    );
  }
}

class _PathCard extends StatelessWidget {
  const _PathCard({
    required this.path,
    required this.selected,
    required this.onTap,
  });

  final AuratioPath path;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      key: OnboardingKeys.pathCard(path),
      container: true,
      checked: selected,
      label: '${path.label}. ${path.description}',
      value: selected ? 'Selected' : 'Not selected',
      hint: selected ? 'Double tap to deselect' : 'Double tap to select',
      onTap: onTap,
      excludeSemantics: true,
      child: Stack(
        fit: StackFit.expand,
        children: [
          AuratioCard(
            tone: selected
                ? AuratioCardTone.brandSoft
                : AuratioCardTone.defaultTone,
            borderColor: selected
                ? AuratioColors.borderDefault
                : AuratioColors.borderStrong,
            padding: EdgeInsets.zero,
            child: Stack(
              children: [
                Positioned(
                  left: 16,
                  top: 34,
                  child: _PathCheckbox(selected: selected),
                ),
                Positioned(
                  left: 58,
                  right: 16,
                  top: 24,
                  child: Text(
                    path.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AuratioTypography.titleMedium.copyWith(
                      color: AuratioColors.textPrimary,
                      fontSize: 16,
                      height: 23 / 16,
                    ),
                  ),
                ),
                Positioned(
                  left: 58,
                  right: 16,
                  top: 54,
                  child: Text(
                    path.description,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AuratioTypography.bodySmall.copyWith(
                      color: AuratioColors.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              excludeFromSemantics: true,
              borderRadius: BorderRadius.circular(AuratioRadii.lg),
            ),
          ),
        ],
      ),
    );
  }
}

class _PathCheckbox extends StatelessWidget {
  const _PathCheckbox({required this.selected});

  final bool selected;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: selected
            ? AuratioColors.backgroundBrand
            : AuratioColors.surfaceDefault,
        border: Border.all(
          color: selected
              ? AuratioColors.backgroundBrand
              : AuratioColors.borderStrong,
        ),
        borderRadius: BorderRadius.circular(6),
      ),
      child: SizedBox.square(
        dimension: 24,
        child: selected
            ? Center(
                child: Text(
                  '✓',
                  textAlign: TextAlign.center,
                  style: AuratioTypography.labelLarge.copyWith(
                    color: AuratioColors.textOnBrand,
                    fontSize: 14,
                    height: 18 / 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              )
            : null,
      ),
    );
  }
}

class _PathGuidanceCard extends StatelessWidget {
  const _PathGuidanceCard();

  @override
  Widget build(BuildContext context) {
    return AuratioCard(
      tone: AuratioCardTone.subtle,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'You can develop across multiple paths.',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AuratioTypography.labelLarge.copyWith(
              color: AuratioColors.backgroundBrand,
              fontSize: 13,
              height: 19 / 13,
              letterSpacing: AuratioTypography.normalTracking,
            ),
          ),
          const SizedBox(height: 7),
          Text(
            'You can change these later from Profile / Settings.',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AuratioTypography.bodySmall.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../authentication/application/auth_repository_provider.dart';
import '../../../onboarding/presentation/screens/choose_paths_screen.dart';
import '../../application/profile_repository_provider.dart';
import '../../application/profile_state_providers.dart';
import 'manage_paths_screen.dart';
import 'profile_screen.dart';
import 'settings_screen.dart';

class PersistedProfileRouteScreen extends ConsumerWidget {
  const PersistedProfileRouteScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(persistedEndUserProfileProvider);
    return profile.when(
      data: (value) => ProfileScreen(
        displayName: value.displayName,
        email: value.email,
        persistedPaths: value.paths,
      ),
      loading: () => const _ProfileIntegrationLoading(),
      error: (error, stackTrace) => _ProfileIntegrationError(
        message: _errorMessage(error, 'Unable to load your Auratio profile.'),
        onRetry: () => ref.invalidate(persistedEndUserProfileProvider),
      ),
    );
  }
}

class PersistedSettingsRouteScreen extends ConsumerWidget {
  const PersistedSettingsRouteScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(persistedEndUserProfileProvider);
    return profile.when(
      data: (value) => SettingsScreen(
        email: value.email,
        onSignOut: () async {
          await ref.read(authRepositoryProvider).signOut();
          ref.invalidate(persistedEndUserProfileProvider);
          ref.invalidate(persistedSelectedPathsProvider);
        },
      ),
      loading: () => const _ProfileIntegrationLoading(),
      error: (error, stackTrace) => _ProfileIntegrationError(
        message: _errorMessage(error, 'Unable to load your account settings.'),
        onRetry: () => ref.invalidate(persistedEndUserProfileProvider),
      ),
    );
  }
}

class PersistedChoosePathsRouteScreen extends ConsumerWidget {
  const PersistedChoosePathsRouteScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paths = ref.watch(persistedSelectedPathsProvider);
    return paths.when(
      data: (value) => ChoosePathsScreen(
        initialPaths: value,
        onPersistedContinue: (selection) async {
          await ref
              .read(auratioProfileRepositoryProvider)
              .replacePaths(selection);
          ref.invalidate(persistedSelectedPathsProvider);
          ref.invalidate(persistedEndUserProfileProvider);
        },
      ),
      loading: () => const _ProfileIntegrationLoading(),
      error: (error, stackTrace) => _ProfileIntegrationError(
        message: _errorMessage(
          error,
          'Unable to load your selected Auratio Paths.',
        ),
        onRetry: () => ref.invalidate(persistedSelectedPathsProvider),
      ),
    );
  }
}

class PersistedManagePathsRouteScreen extends ConsumerWidget {
  const PersistedManagePathsRouteScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paths = ref.watch(persistedSelectedPathsProvider);
    return paths.when(
      data: (value) => ManagePathsScreen(
        initialPaths: value,
        onPersistedSave: (selection) async {
          await ref
              .read(auratioProfileRepositoryProvider)
              .replacePaths(selection);
          ref.invalidate(persistedSelectedPathsProvider);
          ref.invalidate(persistedEndUserProfileProvider);
        },
      ),
      loading: () => const _ProfileIntegrationLoading(),
      error: (error, stackTrace) => _ProfileIntegrationError(
        message: _errorMessage(
          error,
          'Unable to load your selected Auratio Paths.',
        ),
        onRetry: () => ref.invalidate(persistedSelectedPathsProvider),
      ),
    );
  }
}

String _errorMessage(Object error, String fallback) {
  final text = error.toString();
  final separator = text.indexOf(': ');
  if (separator >= 0 && separator + 2 < text.length) {
    return text.substring(separator + 2);
  }
  return fallback;
}

class _ProfileIntegrationLoading extends StatelessWidget {
  const _ProfileIntegrationLoading();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: AuratioColors.backgroundApp,
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

class _ProfileIntegrationError extends StatelessWidget {
  const _ProfileIntegrationError({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AuratioColors.backgroundApp,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: AuratioTypography.bodyMedium,
                ),
                const SizedBox(height: 16),
                AuratioButton(label: 'Try Again', onPressed: onRetry),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

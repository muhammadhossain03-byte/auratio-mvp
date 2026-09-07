class AuratioSupabaseConfig {
  const AuratioSupabaseConfig({
    required this.url,
    required this.publishableKey,
  });

  factory AuratioSupabaseConfig.fromEnvironment() {
    return const AuratioSupabaseConfig(
      url: String.fromEnvironment('SUPABASE_URL'),
      publishableKey: String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY'),
    );
  }

  final String url;
  final String publishableKey;

  bool get isConfigured =>
      url.trim().isNotEmpty && publishableKey.trim().isNotEmpty;

  void validate() {
    final hasUrl = url.trim().isNotEmpty;
    final hasKey = publishableKey.trim().isNotEmpty;

    if (!hasUrl && !hasKey) {
      return;
    }
    if (!hasUrl || !hasKey) {
      throw const AuratioSupabaseConfigurationException(
        'SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be provided together.',
      );
    }

    final uri = Uri.tryParse(url.trim());
    if (uri == null ||
        uri.scheme != 'https' ||
        !uri.host.endsWith('.supabase.co')) {
      throw const AuratioSupabaseConfigurationException(
        'SUPABASE_URL must be an https://*.supabase.co project URL.',
      );
    }
  }
}

class AuratioSupabaseConfigurationException implements Exception {
  const AuratioSupabaseConfigurationException(this.message);

  final String message;

  @override
  String toString() => 'AuratioSupabaseConfigurationException: $message';
}

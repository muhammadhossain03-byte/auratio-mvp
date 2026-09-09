import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_plugins/url_strategy.dart';

import 'app/app.dart';
import 'foundation/integration/auratio_supabase.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  usePathUrlStrategy();
  await AuratioSupabase.initializeFromEnvironment();
  runApp(const ProviderScope(child: AuratioApp()));
}

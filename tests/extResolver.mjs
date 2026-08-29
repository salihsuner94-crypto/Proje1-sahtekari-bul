// Vite uzantısız import'ları ("../constants/gameConfig") çözer, çıplak Node çözmez.
// Bu yükleyici testlerde aradaki farkı kapatır. Proje koduna dokunmaz.
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (specifier.startsWith('.') && !specifier.endsWith('.js')) {
      return next(`${specifier}.js`, context);
    }
    throw error;
  }
}

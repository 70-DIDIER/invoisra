const { withAndroidStyles } = require('expo/config-plugins');

function withDisableSplashScreenDim(config) {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults;
    const styleArray = styles.resources.style || [];

    const splashStyle = styleArray.find(
      (s) => s.$.name === 'Theme.App.SplashScreen'
    );

    if (splashStyle) {
      const items = splashStyle.item || [];
      const hasDim = items.some(
        (item) =>
          item.$.name === 'windowSplashScreenDimBackground' ||
          item.$.name === 'android:windowSplashScreenDimBackground'
      );

      if (!hasDim) {
        items.push({
          $: { name: 'windowSplashScreenDimBackground' },
          _: 'false',
        });
      }
    }

    return config;
  });
}

module.exports = withDisableSplashScreenDim;

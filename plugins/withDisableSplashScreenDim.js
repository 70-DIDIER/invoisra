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

      const setItem = (name, value) => {
        const existing = items.findIndex((item) => item.$.name === name);
        if (existing >= 0) {
          items[existing]._ = value;
        } else {
          items.push({ $: { name }, _: value });
        }
      };

      setItem('android:windowSplashScreenDimBackground', 'false');
      setItem('android:windowSplashScreenIconBackgroundColor', '@android:color/transparent');
    }

    return config;
  });
}

module.exports = withDisableSplashScreenDim;

module.exports = {
  dependencies: {
    'react-native-mmkv': {
      platforms: {
        android: {
          packageImportPath: 'import com.mrousavy.mmkv.MmkvPackage;',
          packageInstance: 'new MmkvPackage()',
        },
      },
    },
  },
};

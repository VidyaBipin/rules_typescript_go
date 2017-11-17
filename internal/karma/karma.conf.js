// Karma configuration
// GENERATED BY Bazel
module.exports = function(config) {
  if (process.env['IBAZEL_NOTIFY_CHANGES'] === 'y') {
    // Tell karma to only listen for ibazel messages on stdin rather than watch all the input files
    // This is from fork alexeagle/karma in the ibazel branch:
    // https://github.com/alexeagle/karma/blob/576d262af50b10e63485b86aee99c5358958c4dd/lib/server.js#L172
    config.set({watchMode: 'ibazel'});
  }

  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: 'TMPL_basePath',
    files: [
      '../build_bazel_rules_typescript/internal/karma/test-main.js',
      TMPL_files
    ],
    plugins: ['karma-*', 'karma-concat-js'],
    frameworks: ['jasmine', 'concat_js', 'requirejs'],
    client: {
      args: ["TMPL_workspace_name"]
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    // note: run_karma.sh may override this as a command-line option.
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}

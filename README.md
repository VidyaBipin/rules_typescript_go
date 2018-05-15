# TypeScript rules for Bazel

Circle CI | Bazel CI
:---: | :---:
[![CircleCI](https://circleci.com/gh/bazelbuild/rules_typescript.svg?style=svg)](https://circleci.com/gh/bazelbuild/rules_typescript) | [![Build status](https://badge.buildkite.com/7f98e137cd86baa5a4040a7e750bef87ef5fd293092fdaf878.svg)](https://buildkite.com/bazel/typescript-rules-typescript-postsubmit)

**WARNING: this is an early release with limited features. Breaking changes are likely. Not recommended for general use.**

The TypeScript rules integrate the TypeScript compiler with Bazel.

## API Docs

Generated documentation for using each rule is at:
http://tsetse.info/api/

## Installation

First, install a current Bazel distribution.

Create a `BUILD.bazel` file in your project root:

```python
package(default_visibility = ["//visibility:public"])
exports_files(["tsconfig.json"])

# NOTE: this will move to node_modules/BUILD in a later release
filegroup(name = "node_modules", srcs = glob([
    "node_modules/**/*.js",
    "node_modules/**/*.d.ts",
    "node_modules/**/*.json",
]))
```

Next create a `WORKSPACE` file in your project root (or edit the existing one)
containing:

```python
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

# rules_nodejs provides build rules related to NPM and Yarn package management,
# which are used for modeling the dependencies between user TypeScript code and
# NPM or Yarn packages. It also provides testing and bundling rules that are
# not specific to TypeScript (such as `jasmine_node_test` and `rollup_bundle`.)
git_repository(
    name = "build_bazel_rules_nodejs",
    remote = "https://github.com/bazelbuild/rules_nodejs.git",
    # Update the tag below to the latest rules_nodejs release when installing.
    tag = "0.3.1",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories")

node_repositories(package_json = ["//:package.json"])


# Include @bazel/typescript in package.json#devDependencies
local_repository(
    name = "build_bazel_rules_typescript",
    path = "node_modules/@bazel/typescript",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()

# ts_devserver needs the Go rules.
# See https://github.com/bazelbuild/rules_go#setup for the latest version.
http_archive(
    name = "io_bazel_rules_go",
    url = "https://github.com/bazelbuild/rules_go/releases/download/0.9.0/rules_go-0.9.0.tar.gz",
    sha256 = "4d8d6244320dd751590f9100cf39fd7a4b75cd901e1f3ffdfd6f048328883695",
)

load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")

go_rules_dependencies()
go_register_toolchains()
```

We recommend using the Yarn package manager, because it has a built-in command
to verify the integrity of your `node_modules` directory.
You can run the version Bazel has already installed:

```sh
$ bazel run @yarn//:yarn
```

## Usage

### Compiling TypeScript: `ts_library`

The `ts_library` rule invokes the TypeScript compiler on one compilation unit,
or "library" (generally one directory of source files).

Create a `BUILD` file next to your sources:

```python
package(default_visibility=["//visibility:public"])
load("@build_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "my_code",
    srcs = glob(["*.ts"]),
    deps = ["//path/to/other:library"],
    tsconfig = "//:tsconfig.json",
)
```

Then build it:

`bazel build //path/to/package:target`

The resulting `.d.ts` file paths will be printed. Additionally, the `.js`
outputs from TypeScript will be written to disk, next to the `.d.ts` files <sup>1</sup>.

> <sup>1</sup> The
> [declarationDir](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
> compiler option will be silently overwritten if present.

### Serving TypeScript for development

There are two choices for development mode:

1. Use the `ts_devserver` rule to bring up our simple, fast development server.
   This is intentionally very simple, to help you get started quickly. However,
   since there are many development servers available, we do not want to mirror
   their features in yet another server we maintain.
1. Teach your real frontend server to serve files from Bazel's output directory.
   This is not yet documented. Choose this option if you have an existing server
   used in development mode, or if your requirements exceed what the
   `ts_devserver` supports. Be careful that your development round-trip stays
   fast (should be under two seconds).

To use `ts_devserver`, you simply `load` the rule, and call it with `deps` that
point to your `ts_library` target(s):

```python
load("@build_bazel_rules_typescript//:defs.bzl", "ts_devserver", "ts_library")

ts_library(
    name = "app",
    srcs = ["app.ts"],
)

ts_devserver(
    name = "devserver",
    # We'll collect all the devmode JS sources from these TypeScript libraries
    deps = [":app"],
    # This is the path we'll request from the browser, see index.html
    serving_path = "/bundle.js",
    # The devserver can serve our static files too
    static_files = ["index.html"],
)
```

The `index.html` should be the same one you use for production, and it should
load the JavaScript bundle from the path indicated in `serving_path`.

If you don't have an index.html file, a simple one will be generated by the
`ts_devserver`.

See `examples/app` in this repository for a working example. To run the
devserver, we recommend you use [ibazel]:

```sh
$ ibazel run examples/app:devserver
```

`ibazel` will keep the devserver program running, and provides a LiveReload
server so the browser refreshes the application automatically when each build
finishes.

[ibazel]: https://github.com/bazelbuild/bazel-watcher

## Writing TypeScript code for Bazel

Bazel's TypeScript compiler has your workspace path mapped, so you can import
from an absolute path starting from your workspace.

`/WORKSPACE`:
```python
workspace(name = "myworkspace")
```

`/some/long/path/to/deeply/nested/subdirectory.ts`:
```javascript
import {thing} from 'myworkspace/place';
```

will import from `/place.ts`.

## Notes

If you'd like a "watch mode", try https://github.com/bazelbuild/bazel-watcher
(note, it's also quite new).

At some point, we plan to release a tool similar to [gazelle] to generate the
BUILD files from your source code.

In the meantime, we suggest associating the `.bazel` extension with Python in
your editor, so that you get useful syntax highlighting.

[gazelle]: https://github.com/bazelbuild/rules_go/tree/master/go/tools/gazelle

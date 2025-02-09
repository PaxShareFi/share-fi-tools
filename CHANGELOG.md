# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of token holder snapshot tool
- Support for custom Helius API key via .env file
- CSV output format for airdrop distributions
- JSON output format with detailed holder data
- Minimum holding requirement ($5 USD worth of SHARE)
- Excluded wallets list for filtering out liquidity pools
- Detailed console logging of process and calculations

### Changed

- Updated documentation to clarify price parameter format
- Made airdrop amount parameter token-agnostic

### Fixed

- Added proper environment variable handling with fallback
- Improved error handling for API requests

## [1.0.0] - 2024-02-09

- Initial version

[Unreleased]: https://github.com/yourusername/share-fi-tools/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/share-fi-tools/releases/tag/v1.0.0

# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.17.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.16.2...recnet-web-v1.17.0) (2024-12-03)


### Features

* add delete slack oauth api ([684b434](https://github.com/lil-lab/recnet/commit/684b434264260798cee53d46628ad073cdff4e41))
* add new api model and trpc procedures ([c6aa4e4](https://github.com/lil-lab/recnet/commit/c6aa4e42b92ac3490fa8e350f02327a5a23b1132))
* add slack oauth flow result dialog ([aead235](https://github.com/lil-lab/recnet/commit/aead2350138e9d33a1734db77cde464edcca84b7))
* encrypt access token ([2e37bf4](https://github.com/lil-lab/recnet/commit/2e37bf4619f5ade5fb4a456fdc231cdb38ab10fb))
* finish changes in subscription setting ([2451712](https://github.com/lil-lab/recnet/commit/245171205af7b42be481aacac819fd330beff295))
* finish route handler ([71ddc42](https://github.com/lil-lab/recnet/commit/71ddc42edbeab3aa06ca32e97b1a82caf797f7f4))
* forward error message from slack ([be75ad6](https://github.com/lil-lab/recnet/commit/be75ad61382ce7b0c31f97f22391241687fd8392))
* integrate slack oauth access ([0811c6a](https://github.com/lil-lab/recnet/commit/0811c6a9d79745e7436faa18e916e5a6edad4ca3))
* refactor ui ([2a0806e](https://github.com/lil-lab/recnet/commit/2a0806e762301920e85bc104759bb5c6143bdd1b))
* refactor UI ([bc44d39](https://github.com/lil-lab/recnet/commit/bc44d3955c0e580c67659ac367d379aec52bcb51))
* send message with new access token ([f75fa90](https://github.com/lil-lab/recnet/commit/f75fa90e49eb70fb00ea53a023df510a2be86d54))
* slack fields db migration ([87e1f40](https://github.com/lil-lab/recnet/commit/87e1f40ecfa1d6d723827df6416b2d34948d660a))
* update user db ([dfb61cd](https://github.com/lil-lab/recnet/commit/dfb61cdef757903a151178707ef8e0741f12236d))
* use recnet-api endpoints ([3fa73bd](https://github.com/lil-lab/recnet/commit/3fa73bd9034d56c8e6efe9380151046a7ac4f35a))


### Bug Fixes

* bring redirect uri in req ([604b857](https://github.com/lil-lab/recnet/commit/604b857b77b25396482b3be162f784213b1d82f0))
* env var ci ([8e6ab8d](https://github.com/lil-lab/recnet/commit/8e6ab8d1033cfae206282724904091bd83117145))
* fix bug ([d28e288](https://github.com/lil-lab/recnet/commit/d28e2881e1bfc161ef9bd81397f1399f63e901b3))
* fix bug ([47a2e71](https://github.com/lil-lab/recnet/commit/47a2e7136fd46608ca88d91fd2d79d258319975d))
* pass redirect uri to slack oauth api ([0197f08](https://github.com/lil-lab/recnet/commit/0197f08a0142f637147e7dd2c243f2a2af86afe6))
* send redirect uri to slac Oauth access API ([#369](https://github.com/lil-lab/recnet/issues/369)) ([7ee2539](https://github.com/lil-lab/recnet/commit/7ee2539255f7d059eccf1762f49158ea4843d5e0))

## [1.16.2](https://github.com/lil-lab/recnet/compare/recnet-web-v1.16.1...recnet-web-v1.16.2) (2024-11-18)


### Features

* add new slack msg template ([7807854](https://github.com/lil-lab/recnet/commit/780785445461f437b93ec1e9f325470120f38d98))
* finish update slack msg template ([3860d5e](https://github.com/lil-lab/recnet/commit/3860d5e2ac7b92cb162aa5fc3b10073a85fbc518))
* follow the person who invites the user ([2f213ae](https://github.com/lil-lab/recnet/commit/2f213ae8c5cf992281ebfc8ccac8f1fc9399fb92))
* install slack block builder ([4d771a6](https://github.com/lil-lab/recnet/commit/4d771a61da05415a78078cb4abd0528b73c7f0b7))


### Bug Fixes

* use prisma instance inside the transaction ([75e5bcd](https://github.com/lil-lab/recnet/commit/75e5bcde05941e9d5dd20dca1d6e5b214e593395))

## [1.16.1](https://github.com/lil-lab/recnet/compare/recnet-web-v1.16.0...recnet-web-v1.16.1) (2024-11-08)


### Bug Fixes

* fix login bug ([050776a](https://github.com/lil-lab/recnet/commit/050776a287db6bfa625cf7bad7e1f74d7db23b00))

## [1.16.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.15.2...recnet-web-v1.16.0) (2024-11-08)


### Features

* add GET /users/subscriptions ([aacff5e](https://github.com/lil-lab/recnet/commit/aacff5e9599dff37390856e44532056585307700))
* add POST /users/subscriptions ([41dfeb9](https://github.com/lil-lab/recnet/commit/41dfeb96a40cdb00d64f4c2cb2db27f77546a6a9))
* add subscription API model and schema ([67de25f](https://github.com/lil-lab/recnet/commit/67de25faeeb26e5fb74fe1be404483e31541ff6a))
* add subscription card ([d77a169](https://github.com/lil-lab/recnet/commit/d77a1695898b2c62b7189294db50cd9082fd03f9))
* add Subscription setting page ([6750714](https://github.com/lil-lab/recnet/commit/67507145fc7f09f3df9031d705034d6b75756a6b))
* finish subscription setting panel ([2421bd6](https://github.com/lil-lab/recnet/commit/2421bd6140595797340eead29349113ffdc4e686))
* finish subscription trpc procedures ([d2e44ad](https://github.com/lil-lab/recnet/commit/d2e44adf0f15e7db584b191fe20eae2318284548))
* migrate email digest ([9aac34f](https://github.com/lil-lab/recnet/commit/9aac34f2f1d2b5aae0b5a40b9db9f9acf6d80a93))
* send slack digest ([b947311](https://github.com/lil-lab/recnet/commit/b9473115ffb32aa0d4ae2b61558ee444fbb4529a))


### Bug Fixes

* fix typo ([0977b90](https://github.com/lil-lab/recnet/commit/0977b90696e3c618e871036ae0c32695f8b90f11))

## [1.15.2](https://github.com/lil-lab/recnet/compare/recnet-web-v1.15.1...recnet-web-v1.15.2) (2024-10-29)


### Features

* add abstract to article ([fa1d749](https://github.com/lil-lab/recnet/commit/fa1d7493c497114b43a3082acdd4890b2a13f621))
* add announcement to email ([bb4438f](https://github.com/lil-lab/recnet/commit/bb4438fa475f74eb9021ff8916f36e7f91ed7759))
* add invite code call to action block in email template ([dd7943e](https://github.com/lil-lab/recnet/commit/dd7943e1093ad9793e1c08479bfff7ee250fde6b))
* add subscription table in DB ([1d7e471](https://github.com/lil-lab/recnet/commit/1d7e471019913a9aea8103b9b9a36002e573cc10))
* finish adding reaction button ([6058013](https://github.com/lil-lab/recnet/commit/605801337364441ed8d17e2830a3df74dcff7223))
* integrate slack api ([04445d9](https://github.com/lil-lab/recnet/commit/04445d9874307f6031a3ed658660761d1aa07669))
* open emoji popover using search params ([fb16d33](https://github.com/lil-lab/recnet/commit/fb16d33a849d7d477debf289e6434b8b1c8b6750))


### Bug Fixes

* adjust og size ([f9ce7f0](https://github.com/lil-lab/recnet/commit/f9ce7f058c7747f6687c0a261c2ac3dc9f45c107))
* apply lint fix ([87174fa](https://github.com/lil-lab/recnet/commit/87174fa282170e0868f02297709b835e4f0c8268))
* cover uncovered case in optimistic UI ([3039496](https://github.com/lil-lab/recnet/commit/3039496b0c5df5c1501b503264ed0d6dcb6c0e12))
* fix action ([5b523f2](https://github.com/lil-lab/recnet/commit/5b523f2e03391e750948614a2b67254f60f64c85))
* fix action ([263e2cd](https://github.com/lil-lab/recnet/commit/263e2cd89fdd6ef65faf07a936186ee69adeed7c))
* fix metadata desc ([49d6399](https://github.com/lil-lab/recnet/commit/49d63998064d2c92908aa16ddd5bc67d08e8ddcd))
* fix pnpm lock ([bbc6cf8](https://github.com/lil-lab/recnet/commit/bbc6cf8edef2f525acae4d7757a7482da3e1e6b1))
* upgrade nextjs version ([545a368](https://github.com/lil-lab/recnet/commit/545a36887a89054654356de3d1f4e2e0db5719c0))

## [1.15.1](https://github.com/lil-lab/recnet/compare/recnet-web-v1.15.0...recnet-web-v1.15.1) (2024-10-20)

### Bug Fixes

- fix bug: did not priortize verfied rec ([b049136](https://github.com/lil-lab/recnet/commit/b049136be86e45daac04b77d359384abb9c52e11))

## [1.15.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.14.2...recnet-web-v1.15.0) (2024-10-16)

### Features

- add add/remove reaction procedure ([13d5d1d](https://github.com/lil-lab/recnet/commit/13d5d1d373ae70af9f8498c4f5bc3dd98690618f))
- add AuthOptional decorator ([d804f48](https://github.com/lil-lab/recnet/commit/d804f48c407d01d93588b588960086016ecab1b9))
- add reactions to rec card ([5224b88](https://github.com/lil-lab/recnet/commit/5224b88cadb0820d13b0102e0b2f6ddbddf98fa5))
- add reactions to rec response ([cf809e8](https://github.com/lil-lab/recnet/commit/cf809e8f2929c2e3648c1fec36b26bcc434edc70))
- add verified badge ([26d8533](https://github.com/lil-lab/recnet/commit/26d8533c50434eb60e979feca53443503775a901))
- finish reaction feature ([fb2ea7d](https://github.com/lil-lab/recnet/commit/fb2ea7dfd27094e59463c0c1b155891c2a41a0f2))

### Bug Fixes

- adjust ui ([7cb3f5e](https://github.com/lil-lab/recnet/commit/7cb3f5edddfa908df89139e5068b6956066aa1f8))
- delete unused action ([1546bef](https://github.com/lil-lab/recnet/commit/1546bef2c51f8dc713b85a9b18e160fd6a4eb2a3))

## [1.14.2](https://github.com/lil-lab/recnet/compare/recnet-web-v1.14.1...recnet-web-v1.14.2) (2024-10-09)

### Features

- add DELETE /digital-libraries/:id ([8813f6e](https://github.com/lil-lab/recnet/commit/8813f6efa829672a75356bd59ba8a33ce06d3329))
- add DELETE /recs/{id}/reactions ([5f74ac9](https://github.com/lil-lab/recnet/commit/5f74ac9e7ad46f822dff06f150278df34c5f1562))
- add GET /digital-libraries ([942d525](https://github.com/lil-lab/recnet/commit/942d525f491a45a350bac4737a17d6625ad9fb9a))
- add PATCH /digital-libraries/:id ([e5f358d](https://github.com/lil-lab/recnet/commit/e5f358d01e44e07eab877650d147aa081dbafb67))
- add POST /digital-libraries ([2059d01](https://github.com/lil-lab/recnet/commit/2059d0144bb251b0c166cf0163e614f7af6164b2))
- add POST /digital-libraries/rank ([9e97a88](https://github.com/lil-lab/recnet/commit/9e97a880f3c29e198e56a8957b1b2da24ba91631))
- add POST /recs/{id}/reactions ([bda631e](https://github.com/lil-lab/recnet/commit/bda631ebd6d8953294c53c70bd4b860f09d7d2f8))
- generalize datepicker by adding selection mode ([30fc462](https://github.com/lil-lab/recnet/commit/30fc462f66c7644896694855858295cb3ceaac2c))

### Bug Fixes

- fix datepicker width ([ea9d621](https://github.com/lil-lab/recnet/commit/ea9d621d3477c088ec26af3cb8cafb25a0ba796b))

## [1.14.1](https://github.com/lil-lab/recnet/compare/recnet-web-v1.14.0...recnet-web-v1.14.1) (2024-10-03)

### Features

- get commit using pagination api ([160525e](https://github.com/lil-lab/recnet/commit/160525edf3a32576edb6e30bba3a4431c6f57256))

## [1.14.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.12.0...recnet-web-v1.14.0) (2024-10-02)

### Features

- add open graph for rec page ([98cbe7a](https://github.com/lil-lab/recnet/commit/98cbe7a68723c525bcaedacd9888d2d15631c04e))
- add PR extracting functions ([0e1e8dc](https://github.com/lil-lab/recnet/commit/0e1e8dcb5269c59c6ea0689dbb1921cad041be65))
- add profile page metadata ([e6a4693](https://github.com/lil-lab/recnet/commit/e6a4693133d2a9b18c31684da5a4fc6106b721a8))
- create withServerSideAuth and reduce code duplication at pages which required auth ([8a1384c](https://github.com/lil-lab/recnet/commit/8a1384c21155f3cade4836073650c5c2202884f4))
- finish app og ([1a68452](https://github.com/lil-lab/recnet/commit/1a684529fe8ddd6d91dbbaff046e91faa986566b))
- finish reactivate page and deactivate dialog ([a0a84ce](https://github.com/lil-lab/recnet/commit/a0a84ce9a13746a97f404b8e898d8eaa6731973e))
- finish rec page ([5e44fbc](https://github.com/lil-lab/recnet/commit/5e44fbcf579f86ca9ed08b2c36343b1d2c0b369e))
- finish sharable rec feature ([788381a](https://github.com/lil-lab/recnet/commit/788381a7a85dfd97d32078ec148c67f285fc79cc))
- only run on push on dev branch ([febcee9](https://github.com/lil-lab/recnet/commit/febcee99a24040f6e80f13c00fa0bb39283b181b))
- prioritize verified recs in feeds and weekly digest email ([9be0282](https://github.com/lil-lab/recnet/commit/9be0282b8bf5c9621580416b6341b8d765627873))

### Bug Fixes

- add lint ignore to output build ([5751556](https://github.com/lil-lab/recnet/commit/57515565373e9155c1a2b67862ad3b0d821eae0c))
- disable nx cloud ([6ce1e6f](https://github.com/lil-lab/recnet/commit/6ce1e6fb832f6b1ffffb790b520e02839ca245cf))
- export function interface ([be9b68d](https://github.com/lil-lab/recnet/commit/be9b68df47d92a8f2da405d0477940fd51edcbdb))
- fix action bug ([978639c](https://github.com/lil-lab/recnet/commit/978639c1dd6524df612a4ff5c79dd48130dc7375))
- fix announcement layout ([82b4036](https://github.com/lil-lab/recnet/commit/82b4036a652c695b329e46fabbcbc47e9797eb29))
- fix api timeout ([7eee9f2](https://github.com/lil-lab/recnet/commit/7eee9f2532e76f02fb747a736e770690b1cbb3f3))
- fix bg color ([e87c042](https://github.com/lil-lab/recnet/commit/e87c042f969976286583799d640944c351cd9cb9))
- fix bug ([97221da](https://github.com/lil-lab/recnet/commit/97221dacad354932f38d50e1a352579422f341e0))
- fix bug ([1335f36](https://github.com/lil-lab/recnet/commit/1335f3658b6d8a1c03b8c19ef5a524513a7b52e5))
- fix bug ([7e30294](https://github.com/lil-lab/recnet/commit/7e302943e217f981a0e293cc3566199a8b84a745))
- fix bug ([3869535](https://github.com/lil-lab/recnet/commit/3869535179398c3066f867179a95a8550a0e8068))
- fix bug ([aeff457](https://github.com/lil-lab/recnet/commit/aeff457b253365661718d7901ac175fac3f37678))
- fix bug ([fad7e37](https://github.com/lil-lab/recnet/commit/fad7e37547e83e98ba2e33ed74b595001bcdd97c))
- fix bug ([1ea126a](https://github.com/lil-lab/recnet/commit/1ea126a52dab529aa6cd3dbee28735a944e3bec5))
- fix test ([d1bed64](https://github.com/lil-lab/recnet/commit/d1bed644835a9ce683bf06fc04285b48aaec3ac4))
- fix typo ([7b1ebeb](https://github.com/lil-lab/recnet/commit/7b1ebeb4b02f18ab27a178f4f9c6d9404bbc3080))
- update og for profile page ([a30f29b](https://github.com/lil-lab/recnet/commit/a30f29b6f0e20d28398ca3a54fd2fc2f0bd1e92b))
- use unified link from backend ([be700b0](https://github.com/lil-lab/recnet/commit/be700b057d5896cdaf75bcd044edc3bff7f66000))

## [1.13.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.12.0...recnet-web-v1.13.0) (2024-09-23)

## [1.12.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.11.1...recnet-web-v1.12.0) (2024-09-19)

### Features

- add account setting tab ([24636a5](https://github.com/lil-lab/recnet/commit/24636a51a73fda553afd221079ec3e5c7a31fe4d))
- finish reactivate page and deactivate dialog ([6ba4d0d](https://github.com/lil-lab/recnet/commit/6ba4d0de8c5c44bf267f7e248f3c4e9150821d21))

### Bug Fixes

- allow deactivated user get user info ([fa93f9b](https://github.com/lil-lab/recnet/commit/fa93f9bcaba4c081a241b42d859c408eacd6edb2))
- restrict deactivated user's action ([48c4f25](https://github.com/lil-lab/recnet/commit/48c4f25674b8d8dfb56bbd6b38ac316af5dbea71))

## [1.11.1](https://github.com/lil-lab/recnet/compare/recnet-web-v1.11.0...recnet-web-v1.11.1) (2024-09-12)

### Features

- create withServerSideAuth and reduce code duplication at pages which required auth ([9c42636](https://github.com/lil-lab/recnet/commit/9c426360bb6dd1c572e2074d63f142ee09a1191a))

## [1.11.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.10.2...recnet-web-v1.11.0) (2024-09-10)

### Features

- add ActivatedGuard ([f5ddd31](https://github.com/lil-lab/recnet/commit/f5ddd31df11cff3f99f1d0dc1f39648bc0ff4c52))
- add isActivated in user response ([21d3a07](https://github.com/lil-lab/recnet/commit/21d3a0747820884861fd12f4fbd61f89ed6e236e))
- add isActivated to db user table ([2e33ac9](https://github.com/lil-lab/recnet/commit/2e33ac9b940a1edebf632d597dd1f4614f7d604c))
- add isSelfRec option in RecEditForm ([a22b861](https://github.com/lil-lab/recnet/commit/a22b861f37e1dbf4cba0f6434735cfc75c07f750))
- add new field to rec table: isSelfRec ([1a08aea](https://github.com/lil-lab/recnet/commit/1a08aeaa9d87a2fb31a59f4276c0f7541425fed7))
- add self rec badge in email ([dfbf0e9](https://github.com/lil-lab/recnet/commit/dfbf0e9c2e3beb56e99b682b049f56d560811c37))
- add self-rec checkbox in NewArticleForm ([a096434](https://github.com/lil-lab/recnet/commit/a096434043c8ecef10337bf4af9dd82e9ca33afc))
- add validation to follow/unfollow and get recs api ([d685ee1](https://github.com/lil-lab/recnet/commit/d685ee12f801e405cc0fc0106254027932fa5306))
- create PATCH /update/me/activate API ([d9682af](https://github.com/lil-lab/recnet/commit/d9682af3748879d4091cf0101b28bb2e077fb9b6))
- exclude non-activated following records ([68e46c0](https://github.com/lil-lab/recnet/commit/68e46c02560cc1bf69feced833f9ae95563ad582))
- exclude non-activated users when querying users ([a1b8f57](https://github.com/lil-lab/recnet/commit/a1b8f57531f216d71e7d7d0effd39c0d3885f8f5))
- include selfRec property in rec model ([16d3f55](https://github.com/lil-lab/recnet/commit/16d3f554c424c7e9ae998369db80f2221e9138df))
- mark self rec in rec card ([25dcc3d](https://github.com/lil-lab/recnet/commit/25dcc3df1310330dbd148112569a542776f1b804))
- update create/edit upcoming rec APIs to enable self-rec feature ([15d1915](https://github.com/lil-lab/recnet/commit/15d1915996fdf8f5be6fe660097b51fdcfa8f64d))

### Bug Fixes

- add error ui when api is down ([cf199d6](https://github.com/lil-lab/recnet/commit/cf199d6d1dd1ad15086851d81e4cfda257304082))
- disable nx cloud in CI pipeline ([74fd55c](https://github.com/lil-lab/recnet/commit/74fd55caad5b0b81d45a903294a18f18a81abc77))

## [1.10.2](https://github.com/lil-lab/recnet/compare/recnet-web-v1.10.0...recnet-web-v1.10.2) (2024-09-08)

### Bug Fixes

- add error ui when api is down ([6d4a924](https://github.com/lil-lab/recnet/commit/6d4a924bf8d1aa54314a10144fecd87743a6bb1b))

## [1.10.1](https://github.com/lil-lab/recnet/compare/recnet-web-v1.10.0...recnet-web-v1.10.1) (2024-09-08)

### Bug Fixes

- add error ui when api is down ([6d4a924](https://github.com/lil-lab/recnet/commit/6d4a924bf8d1aa54314a10144fecd87743a6bb1b))

## [1.10.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.9.3...recnet-web-v1.10.0) (2024-08-29)

### Features

- change design of about page ([ff389f1](https://github.com/lil-lab/recnet/commit/ff389f1b8645a3d417ac10cdd40758611f57007c))

## [1.9.3](https://github.com/lil-lab/recnet/compare/recnet-web-v1.9.2...recnet-web-v1.9.3) (2024-08-28)

### Bug Fixes

- upcoming rec appear in profile ([766f365](https://github.com/lil-lab/recnet/commit/766f365202f9e741c3304cbd5af78f5e35bacd10))

## [1.9.2](https://github.com/lil-lab/recnet/compare/recnet-web-v1.9.1...recnet-web-v1.9.2) (2024-08-26)

## [1.9.1](https://github.com/lil-lab/recnet/compare/recnet-web-v1.9.0...recnet-web-v1.9.1) (2024-05-21)

### Bug Fixes

- add inapp announcement page to mobile admin menu ([351d026](https://github.com/lil-lab/recnet/commit/351d0260cd0a4c002f44e573153985491c9c8c99))

## [1.9.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.8.0...recnet-web-v1.9.0) (2024-05-19)

### Features

- add announcement create form ([8cf4a1e](https://github.com/lil-lab/recnet/commit/8cf4a1e3befc5f9d44e8b02ccc1e725c3ab5a241))
- add new component: DatePicker ([26de382](https://github.com/lil-lab/recnet/commit/26de382c4d701f205399672d85492e3252fad5c2))
- display announcement at feeds page ([fcca9ae](https://github.com/lil-lab/recnet/commit/fcca9ae1d666d0dc1c63919d7a70ad7295503a92))

## [1.8.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.7.1...recnet-web-v1.8.0) (2024-05-14)

### Features

- add url and numRecs to user and user preview ([d4c5038](https://github.com/lil-lab/recnet/commit/d4c5038d5d5afa38f9087020d6c1dcca36a09585))
- modify api model ([df76030](https://github.com/lil-lab/recnet/commit/df7603087b681eb8ee190b3fbab08b32784322a4))
- **profile:** add numRecs and url ([4708cc7](https://github.com/lil-lab/recnet/commit/4708cc78554ea1153d64d1903e79017f16cb815d))
- **profile:** add url/googleScholarLink/semanticScholarLink/openReviewUsername to profileEditForm ([c4feef9](https://github.com/lil-lab/recnet/commit/c4feef9edba4b8c8848e0e9c4f51d6398f7d6749))
- **user card:** display num of recs ([a0391f7](https://github.com/lil-lab/recnet/commit/a0391f7373c39fdbcde5eabb3e7f2578a1665458))

## [1.7.1](https://github.com/lil-lab/recnet/compare/recnet-web-v1.7.0...recnet-web-v1.7.1) (2024-05-10)

### Bug Fixes

- hide invite code popover when not logged in ([2f905d2](https://github.com/lil-lab/recnet/commit/2f905d29369a65bba25e03b0eb187ae09a5045d8))

## [1.7.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.6.0...recnet-web-v1.7.0) (2024-05-09)

### Features

- add invite code popover ([2d15287](https://github.com/lil-lab/recnet/commit/2d15287957979ba3ad584139b6f43c2e1f032089))
- finish invite code popover in mobile view ([dc99944](https://github.com/lil-lab/recnet/commit/dc99944ccc8034f374e431cb4f67d54624f23d01))
- **provision invite codes:** add invite code provision form and trpc procedure ([d57d6d7](https://github.com/lil-lab/recnet/commit/d57d6d7f57e563e5cb86a10c13cd7dbf35fb6a7c))

### Bug Fixes

- make table row's key unique ([936a304](https://github.com/lil-lab/recnet/commit/936a30495120292f3c34619f0606b5dcd4bfc9f5))

## [1.6.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.5.0...recnet-web-v1.6.0) (2024-05-05)

### Features

- add link for google scholar field, semantic scholar and openreview fields ([c622113](https://github.com/lil-lab/recnet/commit/c622113d4f688f9f2732ed9c9c21da9fe7305b53))
- **recnet:** add new field in onboarding page ([92a367a](https://github.com/lil-lab/recnet/commit/92a367a6cb20024561f072bc40ab7fc6ee809686))

### Bug Fixes

- replace undefined to null in useForm's default values ([d845985](https://github.com/lil-lab/recnet/commit/d8459857752f917cabc317cc86cdaf470ca4e6ef))
- skip email if there is no recs ([3a855f4](https://github.com/lil-lab/recnet/commit/3a855f4bf2c8f16378ad8faff61cad17f7429c22))

## [1.5.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.4.1...recnet-web-v1.5.0) (2024-04-30)

### Features

- add logo as favicon ([2b49032](https://github.com/lil-lab/recnet/commit/2b4903217763aa3ea730671a18930b94a56f8086))
- add recnet logo on headerbar ([3c6574a](https://github.com/lil-lab/recnet/commit/3c6574a0c1a590ae0fa11741308c0022cc40cc08))

## [1.4.1](https://github.com/lil-lab/recnet/compare/recnet-web-v1.4.0...recnet-web-v1.4.1) (2024-04-24)

### Bug Fixes

- **auth:** fix issue: [#220](https://github.com/lil-lab/recnet/issues/220) ([10572ed](https://github.com/lil-lab/recnet/commit/10572edb4f61c031d9f7fe422e5a2f02b2ddf54c))
- **cutoff date picker:** adjust align offset ([b07c152](https://github.com/lil-lab/recnet/commit/b07c152cd8dd076801ed5ff5e24c4c1ff5fbdda0))
- **cutoff date picker:** change preferred side of popover ([f7ff76a](https://github.com/lil-lab/recnet/commit/f7ff76aec3920b365d4c563e09796fa4b332cbf2))
- **cutoff date picker:** reset to today on open to improve ux ([ac3f75a](https://github.com/lil-lab/recnet/commit/ac3f75a14ae76c59962ef9b895df425e30166e46))
- **profile edit form:** fix wording bug and bio field validate logic (change to validate onChange) ([2cf77a4](https://github.com/lil-lab/recnet/commit/2cf77a49b270cfb3f6ed1c76de8c7d1a2d77c334)), closes [#219](https://github.com/lil-lab/recnet/issues/219)

## [1.4.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.3.0...recnet-web-v1.4.0) (2024-04-24)

### Features

- **cutoff date picker:** able to navigate by selecting month or year ([48983be](https://github.com/lil-lab/recnet/commit/48983be85f3d035a2a4f45c93d0eb140bdee3eba))
- **cutoff date picker:** add cutoff date picker ([4493939](https://github.com/lil-lab/recnet/commit/44939398ae01402dadf005cc7c8cd4a989aaaac2))

## [1.3.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.1.0...recnet-web-v1.3.0) (2024-04-23)

### Features

- adjust bio char limit ([635529c](https://github.com/lil-lab/recnet/commit/635529cf68205fa32fc7b911d72d33a7db5544cd))
- **profile page:** add new field to form: bio, adjust bio display style and skeleton ([2a1e7db](https://github.com/lil-lab/recnet/commit/2a1e7db626c9f9bd23468e8e8211b6bcf8e42d12))
- **profile page:** add user bio display field ([e318445](https://github.com/lil-lab/recnet/commit/e318445c537a67d0a0dc24493829bca61003c4e1))

## [1.2.0](https://github.com/lil-lab/recnet/compare/recnet-web-v1.1.0...recnet-web-v1.2.0) (2024-04-22)

### Features

- **footer:** add branch indicator and shows only at preview and development environment ([7c762b5](https://github.com/lil-lab/recnet/commit/7c762b52782f795bcb68223f3b330a529f331239))
- **footer:** add Version Tag ([a5e3b8c](https://github.com/lil-lab/recnet/commit/a5e3b8c0702fefcd1e6663e312d7df4a6211dc7c))

## 1.1.0 (2024-04-22)

### Features

- **about page:** add link to substack post ([27eefbb](https://github.com/lil-lab/recnet/commit/27eefbb4070fc670db4d11a1d11e624e19d75162))
- **about page:** finish about page ([11c1c8b](https://github.com/lil-lab/recnet/commit/11c1c8b7883c5eea8ad5f8d25689002010824f0a))
- add accordion component and add it in rec forms ([ac5234c](https://github.com/lil-lab/recnet/commit/ac5234cb11502e2917e9b197c0a2fd01f4738162))
- add affiliation char limit at Profile page ([279a5a8](https://github.com/lil-lab/recnet/commit/279a5a85a6c75edd76c09c232da2c5ca4a2ffa7e))
- add announcement banner ([5a4c322](https://github.com/lil-lab/recnet/commit/5a4c32238b9626ee18e11f4bfec73b75c286af9b)), closes [#146](https://github.com/lil-lab/recnet/issues/146)
- add announcement card component ([698a6e5](https://github.com/lil-lab/recnet/commit/698a6e5289f2477bc80b5fd7c76289d15a6efb69))
- add axios and recnetApi instance ([28fb1da](https://github.com/lil-lab/recnet/commit/28fb1da5af506e3319859dc4aecb20e1c2ea430d))
- add copy all invote code button ([bd0b275](https://github.com/lil-lab/recnet/commit/bd0b2756d41af58ca2c289eab8ea3257477c41a4))
- add createContext in trpc ([1952d22](https://github.com/lil-lab/recnet/commit/1952d22d0327137aa42159fb91936f2f394a6971))
- add dark mode support ([b2157ec](https://github.com/lil-lab/recnet/commit/b2157ec8e15d3ba14381d43aed88f6662239591a))
- add edit profile ui ([bce5a57](https://github.com/lil-lab/recnet/commit/bce5a575a87276220d3925d240c565d88ee6d8fd))
- add feed page and layout ([79fce05](https://github.com/lil-lab/recnet/commit/79fce05358d7662f6b2ac2c485bc2d4bf22ca313))
- add feeds page ([d849999](https://github.com/lil-lab/recnet/commit/d849999656e27b3eed2f8f4aebce01be3a9b7870))
- add Footer ([69ea0f4](https://github.com/lil-lab/recnet/commit/69ea0f42dbc64fdf6980c3a310b2f37526158238))
- add ga ([d5f3c2b](https://github.com/lil-lab/recnet/commit/d5f3c2b2af2f4888cafb82e6bedf7434259ac399))
- add headerbar ([bb68c61](https://github.com/lil-lab/recnet/commit/bb68c616e459f58c035d54fcbbfca840c011bf40))
- add invite code monitor page ([2008daf](https://github.com/lil-lab/recnet/commit/2008dafe6dea72464abd01b6e11befe346506593))
- add invite code validation when creating users ([6918efc](https://github.com/lil-lab/recnet/commit/6918efcfe9555d83bc1aee6bb5c2dcae5ad8dbf6))
- add invite codes hook ([9385674](https://github.com/lil-lab/recnet/commit/93856747286921eb34f47a00990c48cb9fdcd37d))
- add left panel rec button ([f8538a7](https://github.com/lil-lab/recnet/commit/f8538a787d60651443338f2d5a24c8cf960f388f))
- add middlewares for trpc ([400341a](https://github.com/lil-lab/recnet/commit/400341a89fd25c2f631a062969dfac3a2c6192e7))
- add not found page ([84f1f32](https://github.com/lil-lab/recnet/commit/84f1f3267a109bb7e513b78693f2f846665b6273))
- add Profile ui ([782f7d5](https://github.com/lil-lab/recnet/commit/782f7d50337e11a4cac5cae8b9f405e1b02e2134))
- add progress bar ([41a0c66](https://github.com/lil-lab/recnet/commit/41a0c665c2046046f4cbc82c46f6f876a4a52eee))
- add RecCard component ([ee4cd87](https://github.com/lil-lab/recnet/commit/ee4cd878ebb635871728f56ddc46bb3073e02f21))
- add search input shortcut ([5510e62](https://github.com/lil-lab/recnet/commit/5510e62eaf3273e3432a0f40e76c7b3adf1b9863))
- add skeleton and add to profile page ([965bf49](https://github.com/lil-lab/recnet/commit/965bf498b1034b1a11f8c72d22a6e00f050cc950))
- add skeleton text component ([ba25378](https://github.com/lil-lab/recnet/commit/ba253780bbfe08bae60bcc63352e39d6041335eb))
- add stat box component ([481c983](https://github.com/lil-lab/recnet/commit/481c9837da0d0141ccf2ea92b51866c752c8b85b))
- add toast after edit profile ([4a585ea](https://github.com/lil-lab/recnet/commit/4a585eaf5fe162746f2eae3c45e8c6c9053e683c))
- add user profile page ([ca9d2b3](https://github.com/lil-lab/recnet/commit/ca9d2b33c666952eeaefaee100a6132ca12906bf))
- add users partial search ([30dc0e0](https://github.com/lil-lab/recnet/commit/30dc0e0c21afc8047500a4f141449ea464838241))
- **admin page:** add page protection ([61d6674](https://github.com/lil-lab/recnet/commit/61d66744e4fd84c513b4be870168ed488220502e))
- **admin panel:** add AxisBottom component to RecsCycleBarChart ([fc08cff](https://github.com/lil-lab/recnet/commit/fc08cffc825ad141424f9ad9c61e807b1c51763c))
- **admin panel:** add left nav bar ([f5a2196](https://github.com/lil-lab/recnet/commit/f5a2196eef97ca05ba7a2a1211dbd7f968a652e4))
- **admin panel:** implement RecsCycleBarChart component ([e2efcdc](https://github.com/lil-lab/recnet/commit/e2efcdc014e7de82065787ec21b9bd6c51293f7a))
- **all user page:** add new page ([7b63594](https://github.com/lil-lab/recnet/commit/7b63594de0152f1990c0cb036be12c51de199f56))
- **error page:** add error page ([b7a73fd](https://github.com/lil-lab/recnet/commit/b7a73fdfe599ef9773dd8b484e1f44ba3f16445f))
- finish admin panel user & rec page ([eb25320](https://github.com/lil-lab/recnet/commit/eb25320fd36fc9f66e4008bf2e97124093839630))
- finish edit user profile ([c601572](https://github.com/lil-lab/recnet/commit/c6015722ba2ee0f7705f248ef115e60e671a1425))
- finish faq page ([30e21b1](https://github.com/lil-lab/recnet/commit/30e21b113726ac3c111ebc6cad431a2e7129db1f))
- **invite code provision page:** add invite code generation feature ([154c664](https://github.com/lil-lab/recnet/commit/154c6641015f139de50bcfcaac30daccae11544e))
- **left panel rec form:** finish form ui ([fdfa38a](https://github.com/lil-lab/recnet/commit/fdfa38aac4111d9a22915e5082020873b07c04bd))
- **left panel:** finish feature: selecting prev cycles ([eed89dc](https://github.com/lil-lab/recnet/commit/eed89dcf815e03416195dc9b00ee0d115a7d3227))
- make left panel sticky ([cda735c](https://github.com/lil-lab/recnet/commit/cda735ca8dd09a511c26cad19fb6ad3b1b2ec811))

### Bug Fixes

- add close button for mobile rec form ui ([d10266e](https://github.com/lil-lab/recnet/commit/d10266e3181f03f626eb3bd21e390bc8f6f350b8)), closes [#122](https://github.com/lil-lab/recnet/issues/122)
- add follow button disable logic ([0178ae5](https://github.com/lil-lab/recnet/commit/0178ae548528521b38fa0e4cfae75950f2d62cc4))
- add nullcheck to correct type infering from DTO ([72bd137](https://github.com/lil-lab/recnet/commit/72bd137fbe36abd79eafc3df4fa4066cf3eb5fec))
- add username blacklist ([473585a](https://github.com/lil-lab/recnet/commit/473585a8e4620e298f10d9368f054123e4a82732)), closes [#141](https://github.com/lil-lab/recnet/issues/141)
- adjust wording ([64d9f10](https://github.com/lil-lab/recnet/commit/64d9f100429ce184e67fed7e34a47a1fd1ceea1f)), closes [#121](https://github.com/lil-lab/recnet/issues/121)
- **api-model:** coerce api params to fix recnet-api validation bug ([74c6b1e](https://github.com/lil-lab/recnet/commit/74c6b1e6d87f1a7adf10bdc46b23b9385d46c1af))
- **auth:** add getTokenServerSide function and refresh server cookies after set custom claim ([40d328d](https://github.com/lil-lab/recnet/commit/40d328d07f8ce161a70d23f73f6428551592757a))
- change mutate to mutateAsync ([3b0c516](https://github.com/lil-lab/recnet/commit/3b0c5162853bb79cf5f422bb2c6d4dc33699ff34))
- clamp invite code gen at 1 ([a79b1c3](https://github.com/lil-lab/recnet/commit/a79b1c3283ece14b3643e5bc82b875e5ade588fc))
- close dropdown when click ([cf040c2](https://github.com/lil-lab/recnet/commit/cf040c2b7d7b012bf5e33a302e3c4bc043db2817))
- disable auto focus after close dialog ([52fd15d](https://github.com/lil-lab/recnet/commit/52fd15d9c8f671a05d83e139bf2b60f8ce144d76))
- downgrade prettier to fix weird lint error ([95f16f2](https://github.com/lil-lab/recnet/commit/95f16f2b5723407cd993ef305bf02672c6e499c5))
- exclude custom decorator from being parse by Zod Validation Pipe ([093d35b](https://github.com/lil-lab/recnet/commit/093d35bc74cbe1a3e395044a76ba9e4773a0b199))
- fix announcement wording and layout ([9fd52bd](https://github.com/lil-lab/recnet/commit/9fd52bd1e97b60ae3ccefa1f46b07ea0513c87d9))
- fix bug in updating upcoming rec ([2e158a3](https://github.com/lil-lab/recnet/commit/2e158a3c0b3f0792bb8a237ec6b5812d97b13c85))
- fix build script bug ([e5542ea](https://github.com/lil-lab/recnet/commit/e5542ea59a14b5f03147584b8e28522bed754b0c))
- fix cron expression ([b0e1fd1](https://github.com/lil-lab/recnet/commit/b0e1fd15469591ce84d3ea119efeed4a7752b32c))
- fix error: props cannot be passed to client component from RSC ([97fb2e6](https://github.com/lil-lab/recnet/commit/97fb2e68dab15ad67ac381b47e7ae274ea0f456a))
- fix getUsersByIds bug ([76fd175](https://github.com/lil-lab/recnet/commit/76fd175d3e710cb35a6a0e6be24c4624e8092d30))
- fix gitignore to ignore created symlink ([5920b67](https://github.com/lil-lab/recnet/commit/5920b671d19f23dbf7d6b8233b5b0a363d8a2a78))
- fix go back button bug and add history provider ([982bb9b](https://github.com/lil-lab/recnet/commit/982bb9b47d7c8b6f1b963fc3fafe9cd8dc78389a))
- fix grep to only find exact matchede project name ([3c8c110](https://github.com/lil-lab/recnet/commit/3c8c1107c4b4a59db6271c19d776cd9ea2e8b20b))
- fix import path typo ([5b872a2](https://github.com/lil-lab/recnet/commit/5b872a22037af0f75b4809d4600f88018d36b7a9))
- fix issue [#113](https://github.com/lil-lab/recnet/issues/113) ([5b7a22b](https://github.com/lil-lab/recnet/commit/5b7a22b47e0c6fb06977a497475559ff388146cd))
- fix local time display bug ([99213b8](https://github.com/lil-lab/recnet/commit/99213b88c31f94b43dd6fe79953d5888a5d00f1d))
- fix nx affect command to use vercel git params ([babac60](https://github.com/lil-lab/recnet/commit/babac60b0e18510458116f4f6e3fc69261b169d0))
- fix rec form month display bug ([bc4bf28](https://github.com/lil-lab/recnet/commit/bc4bf285b4a3e81611d4db141671eb38c4d32aac))
- fix recnet-jwt test ci ([2a24f1e](https://github.com/lil-lab/recnet/commit/2a24f1e347f341575968dacca6fbc226eb463c4c))
- fix script ([c1804ad](https://github.com/lil-lab/recnet/commit/c1804ad8c18a822ba0f326d3e176f589361d0505))
- fix script ([b95113d](https://github.com/lil-lab/recnet/commit/b95113dfa607e2da384039729ce2e2184b9183c1))
- fix script ([f0d375b](https://github.com/lil-lab/recnet/commit/f0d375b367fa360e52e0349597a8f8227d9417a7))
- fix script ([c21ce5d](https://github.com/lil-lab/recnet/commit/c21ce5d395bd266e7cfd1b7e6d48df66f18e7f96))
- fix text and layout of rec status panel ([5d1c6bd](https://github.com/lil-lab/recnet/commit/5d1c6bd278a4e2e5cdd4dfe6a363c84412654489)), closes [#120](https://github.com/lil-lab/recnet/issues/120)
- fix type bugs ([6abb4c1](https://github.com/lil-lab/recnet/commit/6abb4c17867278e855e0779b724d01d7850261ca))
- fix typo ([20f4495](https://github.com/lil-lab/recnet/commit/20f4495ab7d3bd9f16f3ea1b21e3a5ecf9ff5e51))
- fix typo ([069bc3e](https://github.com/lil-lab/recnet/commit/069bc3e4d7bca13773ddbd915d7c41c9a333abfb))
- fix typo in prisma schema ([61a8a16](https://github.com/lil-lab/recnet/commit/61a8a16972aefa194db88acccae789d47104a4d3))
- fix typo in search bar ([faee330](https://github.com/lil-lab/recnet/commit/faee3307e7049b9ebdf2a36aa1dbffd472ba5b9f)), closes [#147](https://github.com/lil-lab/recnet/issues/147)
- fix ui bug ([76b3dba](https://github.com/lil-lab/recnet/commit/76b3dba7783b2c0276301959fb2c4a6090ad670b))
- fix wrong private key format ([ffdbd02](https://github.com/lil-lab/recnet/commit/ffdbd0218dff89d9999f491edda21296f1d6edc8))
- fix wronog response data type ([8291c4a](https://github.com/lil-lab/recnet/commit/8291c4a985ff9a2727f60fe1bf401ffea406354f))
- fix zod pipe: error has unknown type ([b2d6af4](https://github.com/lil-lab/recnet/commit/b2d6af4723f6e8242a06c4522877ee2e481a16de))
- **get feeds:** batch the query since firestore limit the "in" operation up to 30 values ([9a5d6c1](https://github.com/lil-lab/recnet/commit/9a5d6c148419dcf8f70c0e8e3af62ef0b83351e9))
- get provider from source_sign_in_provider ([6df2169](https://github.com/lil-lab/recnet/commit/6df2169119671dcf946625fb868d85e98f453b1e))
- highlight nav item when user is on corresponding page ([f36d44c](https://github.com/lil-lab/recnet/commit/f36d44c870913e3394a8283e7d9d662cb6f1d671))
- **landing page:** fix typo ([e2b2140](https://github.com/lil-lab/recnet/commit/e2b2140f7b2fe2f75f87e763d79731b679e203bd))
- make ignore script more verbose ([2ef7400](https://github.com/lil-lab/recnet/commit/2ef740093ac8b5ef4ba1557b1795535428d38477))
- **mobile feed layout:** fix wrong date format ([619d201](https://github.com/lil-lab/recnet/commit/619d2015847f1c06c584bf384eaee0be8b8d0953))
- modify docs next.config.js ([b3df03c](https://github.com/lil-lab/recnet/commit/b3df03c418b16239c197adfca3a89c125d617f4d))
- modify local time display ([9089921](https://github.com/lil-lab/recnet/commit/9089921ac3230a8a05403fbfa7145fa200650122))
- modify script ([3d20678](https://github.com/lil-lab/recnet/commit/3d20678381dfda6c82054b4b84c6bc46f94435ff))
- modify text in about page ([3bf2a3a](https://github.com/lil-lab/recnet/commit/3bf2a3aea5daaa47243a8789afc5f3eb0f43a9f4)), closes [#119](https://github.com/lil-lab/recnet/issues/119)
- modify text prompt ([7eacd57](https://github.com/lil-lab/recnet/commit/7eacd570600dfa5bcc573304b3b9133a1e21eb03)), closes [#114](https://github.com/lil-lab/recnet/issues/114)
- modify tsconfig: set strict initialization to false ([e352d30](https://github.com/lil-lab/recnet/commit/e352d30139bdf088b6c8b44c590cd52e59849c5e))
- move project tag to project.json ([c1bb4c4](https://github.com/lil-lab/recnet/commit/c1bb4c48bc622e196b60c5810c7a385abe804893))
- move unfollow/follow button ([964cac8](https://github.com/lil-lab/recnet/commit/964cac8bd7bd559c8c62708c79939802f53aa544)), closes [#116](https://github.com/lil-lab/recnet/issues/116)
- **onboard:** fix infinite loading ([39d7aa6](https://github.com/lil-lab/recnet/commit/39d7aa65e9b2f0de9c02e2fc1711361bc58ddfc5))
- place forwardAllArgs next to each command due to nx upgrade breaking change ([cee95c2](https://github.com/lil-lab/recnet/commit/cee95c26064a96c96198f756664ba11e34b904f4))
- **rec form:** add empty checking for author and title field of rec form ([c304404](https://github.com/lil-lab/recnet/commit/c304404e4354724424d90e76fd394e1c097c0401)), closes [#134](https://github.com/lil-lab/recnet/issues/134)
- **rec form:** change mutate to mutateAsync to fix async bug ([2c4d7f0](https://github.com/lil-lab/recnet/commit/2c4d7f0762e6e4293e88c1cd97c2b5ea690e4029))
- **recnet-api-model:** fix lint error ([c7d6aa4](https://github.com/lil-lab/recnet/commit/c7d6aa487b02a849fe51f6fe2b35ce07db5a703b))
- **recnet-api:** fix wrong response type ([9924c1b](https://github.com/lil-lab/recnet/commit/9924c1b81117bc95515895081bb718202200e291))
- **recnet-api:** make get /recs public and fix ordering ([6945af0](https://github.com/lil-lab/recnet/commit/6945af05db4ecdeb1ab93b70f8e8907299691090))
- refactor following records migration script ([beedcec](https://github.com/lil-lab/recnet/commit/beedceca0cdddbe6335eebe270aa69e3e31b0269))
- remove cypress from dep ([270a54f](https://github.com/lil-lab/recnet/commit/270a54f68dae079005f4d9e9995fc77b7b1cf826))
- remove role from create and update me interface ([bc06bf2](https://github.com/lil-lab/recnet/commit/bc06bf212225e69dbbe32bb921af61d8e6b34b40))
- remove separator line ([313857f](https://github.com/lil-lab/recnet/commit/313857f3a8cf1ed538b2a5186ac7d0ef08099c51)), closes [#117](https://github.com/lil-lab/recnet/issues/117)
- remove unique-key warning ([6c400a8](https://github.com/lil-lab/recnet/commit/6c400a86086c2a05cf9040d2a0c8442ce51aecad))
- rename faq to help and update content ([9cabfc2](https://github.com/lil-lab/recnet/commit/9cabfc2fdbce2a6e577e9b40b4df16c7adca05ca)), closes [#115](https://github.com/lil-lab/recnet/issues/115)
- shuffle users in search page and all-users page ([d5aee05](https://github.com/lil-lab/recnet/commit/d5aee059073040e36d40aba884ba88994e68b464)), closes [#140](https://github.com/lil-lab/recnet/issues/140)
- suppress weird error (import stuff from client component in RSC) ([efca748](https://github.com/lil-lab/recnet/commit/efca7487745bce334e6b16edcc051b2ce6f8adfb))
- **tldr field:** make the number of character responsive ([3bdcf32](https://github.com/lil-lab/recnet/commit/3bdcf32c781b3ebcaa0f28290b04e0df4cf7b398)), closes [#131](https://github.com/lil-lab/recnet/issues/131)
- **trpc middleware:** fix validation bug ([6bbc85b](https://github.com/lil-lab/recnet/commit/6bbc85be012a93ca2699a53964172e23ecbba1e9))
- **ui:** fix dark mode bug ([fdfaeef](https://github.com/lil-lab/recnet/commit/fdfaeefd0cc13d9a38e5568af80f0ee4b47d9004))
- **ui:** fix light mode ui bug ([1a9eb8a](https://github.com/lil-lab/recnet/commit/1a9eb8a11995afe7ad0f8b83edc12a710b3c2f67))
- use head instead if VERCEL_GIT_PREVIOUS_SHA is not presented ([d5232a0](https://github.com/lil-lab/recnet/commit/d5232a0dfe121c6f297031c03004cdafdab973db))

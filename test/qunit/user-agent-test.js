/*global QUnit, MTVNPlayer*/

QUnit.test("isHTML5Player",function() {
    var core = MTVNPlayer.require("mtvn-player-test").Core;
    QUnit.ok(core.isHTML5Player("Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.1.0-80) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true") === false, "Silk 1.0");
    QUnit.ok(core.isHTML5Player("Kindle Fire (2012): Mozilla/5.0 (Linux; U; en-us; KFOT Build/IML74K) AppleWebKit/535.19 (KHTML, like Gecko) Silk/2.2 Safari/535.19 Silk-Accelerated=true ") === true, "Silk/2.0");
    QUnit.ok(core.isHTML5Player("Silk/3.0") === true, "Silk/3.0");
    QUnit.ok(core.isHTML5Player("Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25") === true, "iPad");
    QUnit.ok(core.isHTML5Player("Mozilla/6.0 (Windows NT 6.2; WOW64; rv:16.0.1) Gecko/20121011 Firefox/16.0.1") === false, "Firefox");
    QUnit.ok(core.isHTML5Player("Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0") === false, "IE");
    // Android
    QUnit.ok(core.isHTML5Player("Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30") === true, "Android 4");
    QUnit.ok(core.isHTML5Player("Mozilla/5.0 (Linux; U; Android 2.3; en-us) AppleWebKit/999+ (KHTML, like Gecko) Safari/999.9") === false, "Android 2.3");
    QUnit.ok(core.isHTML5Player("") === false, "empty");
    QUnit.ok(core.isHTML5Player(null) === false, "null");
    // Wii U
    QUnit.strictEqual(core.isHTML5Player("User agent: Mozilla/5.0 (Nintendo WiiU) AppleWebKit/534.52 (KHTML, like Gecko) NX/{Version No} NintendoBrowser/{Version No}.US"),true, "Wii U");
});
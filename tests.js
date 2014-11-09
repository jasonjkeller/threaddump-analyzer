/*
Copyright 2014 Spotify AB

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

QUnit.test( "basic thread", function(assert) {
    var header = '"thread name" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new Thread(header).toHeaderString(), '"thread name": runnable');
});

// java version "1.7.0_21"
// Java(TM) SE Runtime Environment (build 1.7.0_21-b12)
// Java HotSpot(TM) 64-Bit Server VM (build 23.21-b01, mixed mode)
QUnit.test( "basic thread 2", function(assert) {
    var header = '"ApplicationImpl pooled thread 1" prio=4 tid=11296d000 nid=0x118a84000 waiting on condition [118a83000]';
    assert.equal(new Thread(header).toHeaderString(), '"ApplicationImpl pooled thread 1": waiting on condition');
});

QUnit.test( "basic thread 3", function(assert) {
    var header = '"Gang worker#1 (Parallel GC Threads)" prio=9 tid=105002800 nid=0x10bc88000 runnable';
    assert.equal(new Thread(header).toHeaderString(), '"Gang worker#1 (Parallel GC Threads)": runnable');
});

QUnit.test( "daemon thread", function(assert) {
    var header = '"thread name" daemon prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new Thread(header).toHeaderString(), '"thread name": daemon, runnable');
});

QUnit.test( "vm thread", function(assert) {
    var header = '"VM Periodic Task Thread" prio=10 tid=0x00007f1af00c9800 nid=0x3c2c waiting on condition ';
    assert.equal(new Thread(header).toHeaderString(), '"VM Periodic Task Thread": waiting on condition');
});

QUnit.test( "sleeping daemon thread", function(assert) {
    var header = '"Store spotify-uuid Spool Thread" daemon prio=10 tid=0x00007f1a16aa0800 nid=0x3f5b sleeping[0x00007f199997a000]';
    assert.equal(new Thread(header).toHeaderString(), '"Store spotify-uuid Spool Thread": daemon, sleeping');
});

QUnit.test( "sleeping thread", function(assert) {
    var header = '"git@github.com:caoliang2598/ta-zelda-test.git#master"}; 09:09:58 Task started; VCS Periodical executor 39" prio=10 tid=0x00007f1728056000 nid=0x1347 sleeping[0x00007f169cdcb000]';
    assert.equal(new Thread(header).toHeaderString(), '"git@github.com:caoliang2598/ta-zelda-test.git#master"}; 09:09:58 Task started; VCS Periodical executor 39": sleeping');
});

QUnit.test( "multiline thread name", function(assert) {
    // It's the Analyzer that joins lines so we have to go through the Analyzer here
    var multilineHeader = '"line 1\nline 2" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    var analyzer = new Analyzer(multilineHeader);
    var threads = analyzer.threads;

    assert.equal(threads.length, 1);
    var threadLines = threads[0].toString().split('\n');
    assert.equal(threadLines.length, 3);
    assert.equal(threadLines[0], '"line 1, line 2": runnable');
    assert.equal(threadLines[1], '	<empty stack>');
    assert.equal(threadLines[2], '');

    // Test the Analyzer's toString() method as well now that we have an Analyzer
    var analysisLines = analyzer.toString().split('\n');
    assert.equal(analysisLines.length, 5);
    assert.equal(analysisLines[0], "1 threads found:");
    assert.equal(analysisLines[1], "");
    assert.equal(analysisLines[2], '"line 1, line 2": runnable');
    assert.equal(analysisLines[3], '	<empty stack>');
    assert.equal(analysisLines[4], "");
});

QUnit.test( "thread stack", function(assert) {
    var header = '"Thread name" prio=10 tid=0x00007f1728056000 nid=0x1347 sleeping[0x00007f169cdcb000]';
    var thread = new Thread(header);
    thread.addStackLine("	at java.security.AccessController.doPrivileged(Native Method)");
    thread.addStackLine("	- eliminated <0x00000006b3ccb178> (a java.io.PipedInputStream)");
    thread.addStackLine("	at java.net.SocksSocketImpl.connect(SocksSocketImpl.java:353)");
    thread.addStackLine("	- parking to wait for  <0x00000003138d65d0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)");

    // When adding stack frames we should just ignore unsupported
    // lines, and the end result should contain only supported data.
    var threadLines = thread.toString().split('\n');
    assert.equal(threadLines.length, 4);
    assert.equal(threadLines[0], '"Thread name": sleeping');
    assert.equal(threadLines[1], "	at java.security.AccessController.doPrivileged(Native Method)");
    assert.equal(threadLines[2], "	at java.net.SocksSocketImpl.connect(SocksSocketImpl.java:353)");
    assert.equal(threadLines[3], "");
});

function unescapeHtml(escaped) {
  var e = document.createElement('div');
  e.innerHTML = escaped;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

QUnit.test( "full dump analysis", function(assert) {
    var input = document.getElementById("sample-input").innerHTML;
    var expectedOutput = unescapeHtml(document.getElementById("sample-analysis").innerHTML);
    var analyzer = new Analyzer(input);
    assert.equal(analyzer.toString(), expectedOutput);
});

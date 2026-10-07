/* tests/surprise.test.js — SỰ KIỆN BẤT NGỜ TRONG CA (yêu cầu thiết kế 07/10/2026)
 * Luật đem đi kiểm: ngày 1-4 yên ổn · ngày 5 có đúng 1 xấu · mỗi ca tối đa 1 xấu + 1 tốt ·
 * sự kiện xấu không lấy quá 12% tiền · mọi lựa chọn đều có hậu quả thật. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SURPRISES, BY_ID, drawEvent, planShift, resolve, cleanScore, collectPending, pendTrafficMul, capBad } from '../js/engine/surprise.js';
import { makeRNG } from '../js/engine/rng.js';
import { newRec } from '../js/engine/state.js';
import { POT_KEYS } from '../js/engine/data.js';
import { shiftMs } from '../js/engine/shift.js';

function makeS(day = 8, money = 3000000) {
  const S = {
    day, money, ls: 0, totalRev: 0, upg: {}, unlocked: {}, stock: {},
    cur: newRec(day)
  };
  POT_KEYS.forEach(k => { S.unlocked[k] = true; S.stock[k] = [{ q: 20, exp: 99 }]; });
  return S;
}
function makeR(served = 4, arrived = 6) {
  return { slots: [], today: { served, wrong: 0, soldLost: 0, stars: [5], arrived, surprise: [] } };
}

test('bảng sự kiện: 8 sự kiện, id duy nhất, mỗi cái 2-3 cách xử lý đều có chữ nghĩa', () => {
  assert.equal(SURPRISES.length, 8);
  const ids = SURPRISES.map(e => e.id);
  assert.equal(new Set(ids).size, 8, 'id không được trùng');
  SURPRISES.forEach(e => {
    assert.ok(e.n && e.ico && (e.kind === 'bad' || e.kind === 'good'));
    assert.ok(typeof e.scene === 'string' || typeof e.scene === 'function', e.id + ' phải có tình huống');
    assert.ok(e.choices.length >= 2 && e.choices.length <= 3, e.id + ' phải có 2-3 cách xử lý');
    e.choices.forEach(c => {
      assert.ok(c.n && c.n.length > 4, e.id + ': nhãn nút phải rõ nghĩa');
      assert.ok(c.d && c.d.length > 10, e.id + ': phải nói trước hậu quả cho người chơi');
      assert.equal(typeof c.run, 'function');
    });
  });
  const xau = SURPRISES.filter(e => e.kind === 'bad').map(e => e.id);
  const tot = SURPRISES.filter(e => e.kind === 'good').map(e => e.id);
  assert.equal(xau.length, 5, 'phải có 5 sự kiện xấu');
  assert.equal(tot.length, 3, 'phải có 3 sự kiện tốt');
  assert.ok(BY_ID.quyt && BY_ID.ve_so && BY_ID.ve_sinh);
});

test('ngày 1-4: yên ổn tuyệt đối, không lên kế hoạch sự kiện nào', () => {
  for (let d = 1; d <= 4; d++) {
    for (let seed = 1; seed <= 60; seed++) {
      const S = makeS(d), R = makeR();
      assert.equal(planShift(S, R, {}, makeRNG(seed), shiftMs()), null, 'ngày ' + d + ' phải yên ổn');
    }
  }
});

test('ngày 5: đúng MỘT sự kiện xấu nhẹ, mốc thời gian nằm trong ca', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const S = makeS(5), R = makeR();
    const plan = planShift(S, R, {}, makeRNG(seed), shiftMs());
    assert.ok(plan, 'ngày 5 phải có sự kiện');
    const bad = plan.events.filter(e => e.kind === 'bad');
    assert.equal(bad.length, 1, 'đúng 1 sự kiện xấu');
    assert.equal(bad[0].mild, true, 'ngày 5 chỉ dùng sự kiện NHẸ');
    plan.events.forEach(e => assert.ok(e.at > 0 && e.at < shiftMs() / 1000, 'mốc phải trong ca'));
    /* tới lúc bắn, bốc sự kiện nhẹ thì phải ra loại mở từ ngày 5 */
    const S5 = makeS(5), R5 = makeR(3);
    for (let seed = 1; seed <= 40; seed++) {
      const ev = drawEvent(S5, R5, {}, makeRNG(seed), 'bad', { mild: true });
      assert.ok(ev && ev.from <= 5, 'sự kiện nhẹ phải mở từ ngày 5: ' + (ev && ev.id));
    }
  }
});

test('từ ngày 6: mỗi ca tối đa 1 xấu + 1 tốt, hai cái không dính sát nhau', () => {
  let coXau = 0, coTot = 0, tong = 0;
  for (let d = 6; d <= 40; d++) {
    for (let seed = 1; seed <= 40; seed++) {
      const S = makeS(d), R = makeR();
      const plan = planShift(S, R, {}, makeRNG(seed), shiftMs());
      const ev = plan ? plan.events : [];
      tong++;
      assert.ok(ev.filter(e => e.kind === 'bad').length <= 1, 'tối đa 1 xấu');
      assert.ok(ev.filter(e => e.kind === 'good').length <= 1, 'tối đa 1 tốt');
      assert.equal(new Set(ev.map(e => e.kind)).size, ev.length, 'mỗi loại chỉ một sự kiện trong ca');
      if (ev.length === 2) {
        assert.ok(Math.abs(ev[1].at - ev[0].at) >= shiftMs() / 1000 * 0.12 - 1, 'cách nhau ít nhất 12% ca');
      }
      if (ev.some(e => e.kind === 'bad')) coXau++;
      if (ev.some(e => e.kind === 'good')) coTot++;
    }
  }
  const tiLeXau = coXau / tong;
  assert.ok(tiLeXau > 0.15 && tiLeXau < 0.4, 'tỉ lệ ca có sự kiện xấu phải ở mức vừa phải, thực tế: ' + (tiLeXau * 100).toFixed(0) + '%');
  assert.ok(coTot > 0, 'phải có ca gặp tin tốt');
});

test('bốc sự kiện: tôn trọng điều kiện (không tiền thì không bốc cảnh giật túi)', () => {
  const S = makeS(10, 300000), R = makeR();
  for (let seed = 1; seed <= 80; seed++) {
    const e = drawEvent(S, R, {}, makeRNG(seed), 'bad');
    assert.notEqual(e.id, 'giat', 'két dưới 2 triệu thì không có cảnh rồ ga');
  }
  const S2 = makeS(10, 5000000);
  let thayGiat = false;
  for (let seed = 1; seed <= 200; seed++) if (drawEvent(S2, makeR(), {}, makeRNG(seed), 'bad').id === 'giat') thayGiat = true;
  assert.ok(thayGiat, 'két dày thì phải có lúc gặp cảnh rồ ga');
});

test('luật 12%: mọi nhánh xấu, mọi seed, không bao giờ lấy quá 12% tiền trong két', () => {
  for (const money of [100000, 800000, 3000000, 25000000]) {
    for (const ev of SURPRISES) {
      for (let ci = 0; ci < ev.choices.length; ci++) {
        for (let seed = 1; seed <= 30; seed++) {
          const S = makeS(10, money), R = makeR();
          const before = S.money;
          const out = resolve(S, R, {}, makeRNG(seed), ev.id, ci);
          assert.ok(out.ok, ev.id + ' phải thi hành được');
          assert.ok(S.money >= before - Math.floor(before * 0.12) - 1,
            ev.id + ' nhánh ' + ci + ' lấy quá 12%: ' + (before - S.money));
        }
      }
    }
  }
  assert.equal(capBad({ money: 1000000 }, 999999), 120000);
});

test('thi hành: ghi vào sổ ngày + sổ ca, có câu chữ và số tiền', () => {
  const S = makeS(10), R = makeR();
  const out = resolve(S, R, {}, makeRNG(7), 've_so', 0);
  assert.ok(out.msg.length > 10, 'phải có lời kể');
  assert.ok(out.money > 0, 'nhận lì xì phải có tiền vào');
  assert.equal(S.cur.surprise.length, 1);
  assert.equal(R.today.surprise.length, 1);
  assert.equal(S.cur.surprise[0].n, 'Khách trúng vé số, lì xì lại quán');
  assert.equal(S.cur.surprise[0].c, out.choice.n);
});

test('thi hành: mỗi sự kiện đều chạy được mọi nhánh, không nhánh nào vô nghĩa', () => {
  SURPRISES.forEach(e => {
    e.choices.forEach((c, ci) => {
      const S = makeS(12, 4000000), R = makeR();
      const out = resolve(S, R, {}, makeRNG(100 + ci), e.id, ci);
      assert.ok(out.ok);
      assert.ok(out.msg && out.msg.length > 8, e.id + ' nhánh ' + ci + ' phải có lời kể');
      const coTacDong = out.money !== 0 || out.exp !== 0 || out.ls !== 0
        || (S.cur.surprise[0].msg || '').length > 0;
      assert.ok(coTacDong, e.id + ' nhánh ' + ci + ' phải có hậu quả');
    });
  });
});

test('thanh tra vệ sinh: quán sạch điểm cao, quán bẩn điểm thấp, kẹp 0-100', () => {
  const sach = makeS(9), Rsach = makeR();
  assert.ok(cleanScore(sach, Rsach) >= 90, 'quán sạch phải ≥ 90 điểm');
  const ban = makeS(9);
  ban.cur.spoil.n = 14; ban.upg = {};
  const Rban = makeR(); Rban.today.wrong = 3; Rban.today.soldLost = 4;
  assert.ok(cleanScore(ban, Rban) < 20, 'quán bẩn phải dưới 20 điểm');
  ban.cur.spoil.n = 999;
  assert.equal(cleanScore(ban, Rban), 0, 'không được âm');
  assert.ok(cleanScore(sach, Rsach) <= 100);
});

test('thanh tra vệ sinh: gửi phong bì có cả hai nhánh (êm / toang)', () => {
  let em = 0, toang = 0;
  for (let seed = 1; seed <= 120; seed++) {
    const S = makeS(12), R = makeR();
    const out = resolve(S, R, {}, makeRNG(seed), 've_sinh', 2);
    if (out.tone === 'bad') toang++; else em++;
  }
  assert.ok(em > 20 && toang > 20, 'phải có cả hai khả năng, thực tế êm=' + em + ' toang=' + toang);
});

test('ghi sổ khách quên trả: tới hạn thì thu được tiền ở đầu ngày sau', () => {
  const S = makeS(10), R = makeR();
  let ghiSo = false;
  for (let seed = 1; seed <= 60 && !ghiSo; seed++) {
    const s2 = makeS(10), r2 = makeR();
    const out = resolve(s2, r2, {}, makeRNG(seed), 'quyt', 2);
    if (s2.pendCollect) { ghiSo = true; S.pendCollect = s2.pendCollect; S.day = s2.pendCollect.due; }
  }
  assert.ok(ghiSo, 'phải có nhánh khách hẹn mai trả');
  const truoc = S.money;
  const out = collectPending(S);
  assert.ok(out.collect > 0 && S.money === truoc + out.collect, 'phải thu đúng khoản ghi sổ');
  assert.equal(S.pendCollect, null, 'thu rồi thì xoá sổ');
  assert.equal(collectPending(S).collect, 0, 'không thu hai lần');
});

test('ảnh hưởng khách của sự kiện: áp đúng ngày hôm sau rồi hết', () => {
  const S = makeS(10), R = makeR();
  const out = resolve(S, R, {}, makeRNG(3), 'hang_xom', 0);   // gửi bà Tư phần ăn
  assert.ok(out.traffic > 0);
  assert.ok(S.pendTraffic && S.pendTraffic.day === 11);
  assert.equal(pendTrafficMul(S), 1, 'ngày 10 chưa áp (sự kiện của chính ngày 10)');
  S.day = 11;
  assert.ok(Math.abs(pendTrafficMul(S) - 1.04) < 1e-9, 'ngày 11 phải được cộng 4% khách');
  S.day = 12;
  collectPending(S);
  assert.equal(pendTrafficMul(S), 1, 'hết hạn thì thôi');
  assert.equal(S.pendTraffic, null);
});

test('sự kiện bất ngờ không phá vỡ luật chơi khác: chỉ đụng tiền/khách/sổ, không xoá đánh giá', () => {
  const S = makeS(11), R = makeR();
  S.reviews = [{ s: 5, t: 'ngon', d: 10 }];
  SURPRISES.forEach(e => e.choices.forEach((c, ci) => {
    const s2 = makeS(11), r2 = makeR();
    s2.reviews = [{ s: 5, t: 'ngon', d: 10 }];
    resolve(s2, r2, {}, makeRNG(11 + ci), e.id, ci);
    assert.equal(s2.reviews.length, 1, e.id + ' không được đụng vào sổ đánh giá');
    assert.ok(Number.isFinite(s2.money), e.id + ' tiền phải là số hợp lệ');
    assert.ok(s2.day === 11, e.id + ' không được nhảy ngày');
  }));
});

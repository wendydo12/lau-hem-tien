/* assets/manifest.js — map key engine → file sprite. Nguồn sự thật duy nhất, UI chỉ đọc file này. */
export const SPRITES = {
  /* chủ quán + khách thường (64x64) */
  owner: 'chars/vn_00.png',
  vn: [ 'chars/vn_01.png','chars/vn_02.png','chars/vn_03.png','chars/vn_04.png','chars/vn_05.png','chars/vn_06.png','chars/vn_07.png','chars/vn_00.png' ],
  /* khách tu tiên (64x64 — đồng bộ scale) */
  xian: Array.from({length:16}, (_,i) => 'chars/xian_' + String(i).padStart(2,'0') + '.png'),
  /* 8 nồi lẩu */
  pot: {
    ca_chua: 'food/pot_00.png', nam: 'food/pot_01.png', suon: 'food/pot_02.png',
    thai: 'food/pot_03.png', suki: 'food/pot_04.png', dong_trung: 'food/pot_05.png',
    tu_xuyen: 'food/pot_06.png', hai_san: 'food/pot_07.png'
  },
  /* topping + nước chấm + bí mật */
  item: {
    t_bo: 'food/topping_00.png', t_tom: 'food/topping_01.png', t_kim_cham: 'food/topping_02.png',
    d_sa_te: 'food/topping_03.png', t_bo_vien: 'food/topping_04.png',
    t_muc: 'food/topping3_00.png', t_ngheu: 'food/topping3_01.png', t_ca_vien: 'food/topping3_02.png',
    t_dau_hu_ky: 'food/topping3_03.png', t_rau_muong: 'food/topping3_04.png', t_mi_goi: 'food/topping3_05.png',
    t_trung: 'food/topping3_07.png',
    d_muoi_ot: 'food/topping2_00.png', d_chao: 'food/topping2_01.png', d_sa_te2: 'food/topping2_02.png',
    d_sot_me: 'food/topping2_03.png', t_udong: 'food/topping2_04.png', t_cai_cuc: 'food/topping2_05.png',
    t_cuu: 'food/new1_00.png', t_de: 'food/new1_01.png', t_ba_chi: 'food/new1_02.png',
    t_ca_dieu: 'food/ca_dieu_lat.png', t_ca_vien_chien: 'food/new1_04.png', t_dau_hu_non: 'food/new1_05.png',
    t_chan_vit: 'food/new1_06.png', t_cai_thia: 'food/new1_07.png',
    d_mix: 'food/new2_00.png', t_cu_sen: 'food/new2_01.png', du_nam_bung_de: 'food/new2_04.png',
    t_dong_co: 'food/new2_05.png', t_dui_ga: 'food/new2_06.png',
    t_gau: 'food/new3_00.png', t_sun: 'food/new3_01.png', t_bun: 'food/new3_02.png', t_mien: 'food/new3_03.png',
    d_hao_du: 'food/dip_01.png', d_bo_dau: 'food/dip_02.png', d_ot_toi: 'food/dip_03.png',
    d_muoi_wasabi: 'food/dip_04.png', d_mayo: 'food/dip_05.png', d_dau_me: 'food/dip_06.png',
    /* thực đơn bí mật */
    x_linh_chi: 'food/topping_05.png', x_huyet_sen: 'food/new2_07.png', x_linh_thu: 'food/topping_06.png',
    x_bang_tam: 'food/topping_07.png', x_nhan_sam: 'food/new2_02.png', x_dong_trung: 'food/new2_03.png',
    x_tuong_tien: 'food/dip_00.png', x_mat_tuong: 'food/dip_07.png'
  },
  /* props */
  prop: {
    neon: 'props/prop_07.png', stool_red: 'props/prop2_00.png', stool_blue: 'props/prop2_01.png',
    pot_copper: 'props/prop2_02.png', crane: 'props/prop2_03.png', cauldron: 'props/prop2_04.png',
    cashbox: 'props/prop2_05.png', coin_old: 'props/prop2_06.png', talisman: 'props/prop2_07.png',
    lantern: 'props/prop_01.png', steamer: 'props/prop_02.png'
  },
  scene: 'scene_alley_night.png'
};

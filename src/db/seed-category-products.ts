import "dotenv/config";

import { seedProductsForOwner, type SeedProduct } from "./seed-helpers";

// The creator these demo products are listed under.
const OWNER_USERNAME = "lucians";

// Real products looked up on emag.ro, giving every category 2–5 items so the
// category filters have something to show. Prices are in whole lei. Pairs with
// seed-products.ts (which already stocks Electronics and Home & Garden).
const products: SeedProduct[] = [
    // ── Clothing ──────────────────────────────────────────────────────────
    {
        name: "Sprandi Geaca de tranzitie barbati, negru",
        price: 110,
        category: "Clothing",
        description: "Geaca de tranzitie pentru barbati Sprandi, culoare negru.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/112038/112037663/images/res_2f4df28292c91c4c9eb5a0726cd99aab.jpg",
    },
    {
        name: "Puma Geaca matlasata cu logo, Negru/Verde inchis",
        price: 220,
        category: "Clothing",
        description: "Geaca matlasata Puma cu logo, culoare negru/verde inchis.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/100022/100021343/images/res_8ee63f181ffc7b0dcb5c10baf0219b40.jpg",
    },
    {
        name: "Nike Geaca cu gluga Therma Repel Park20, Albastru inchis",
        price: 470,
        category: "Clothing",
        description: "Geaca cu gluga Nike Therma Repel Park20, culoare albastru inchis.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/63765/63764480/images/res_0f22e494b03438e7452de4e523551b90.jpg",
    },

    // ── Sports ────────────────────────────────────────────────────────────
    {
        name: "Minge de fotbal marimea 5, antrenament interior/exterior",
        price: 53,
        category: "Sports",
        description: "Minge de fotbal marimea 5 pentru antrenament, interior/exterior.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/104482/104481997/images/res_2c0905d4ec8badb7e22b2f16b3e41724.png",
    },
    {
        name: "Minge fotbal Adidas FIFA World Cup 2026 Trionda League Box, marimea 5",
        price: 161,
        category: "Sports",
        description: "Minge de fotbal Adidas FIFA World Cup 2026 Trionda League Box, multicolor, marimea 5.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/129530/129529689/images/res_bac751d66c230361706a09871165f942.jpg",
    },
    {
        name: "Minge fotbal Cupa Mondiala 2010, set cu ac, marimea 5",
        price: 169,
        category: "Sports",
        description: "Minge de fotbal Cupa Mondiala 2010, negru/alb/galben, marimea 5, set cu ac.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/103755/103754768/images/res_56f42b4b6a131f24ea38d63b09430089.jpg",
    },

    // ── Books ─────────────────────────────────────────────────────────────
    {
        name: "Acolo unde canta racii, Delia Owens",
        price: 59,
        category: "Books",
        description: "Roman best-seller de Delia Owens, „Acolo unde canta racii”.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/78948/78947724/images/res_f56c3004e5612bebc14174a6257aafaa.jpg",
    },
    {
        name: "Pacienta tacuta, Alex Michaelides",
        price: 44,
        category: "Books",
        description: "Thriller psihologic de Alex Michaelides, „Pacienta tacuta”.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/20291/20290937/images/res_80ba1d5c7b928be0ad3d27ff60ba7a01.jpg",
    },
    {
        name: "Vanatorii de zmeie, Khaled Hosseini",
        price: 39,
        category: "Books",
        description: "Roman de Khaled Hosseini, „Vanatorii de zmeie”.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/31187/31186179/images/res_e7513c2f5594a02452bf181c83307511.jpg",
    },

    // ── Vehicles ──────────────────────────────────────────────────────────
    {
        name: "Anvelopa iarna Debica Frigo 2 M+S 205/55R16 91T",
        price: 322,
        category: "Vehicles",
        description: "Anvelopa de iarna Debica Frigo 2 M+S, dimensiune 205/55R16 91T.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/4285/4284632/images/res_5e15cc5ce4f0c2a3e4d55f0a71a764aa.jpg",
    },
    {
        name: "Anvelopa iarna Taurus Winter FR 205/55 R16 91H",
        price: 299,
        category: "Vehicles",
        description: "Anvelopa de iarna Taurus Winter FR, dimensiune 205/55 R16 91H.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/16038/16037404/images/res_bf3ccca0022375850f27fea969059af3.jpg",
    },
    {
        name: "Anvelopa iarna Hankook W462 205/55R16 91H",
        price: 424,
        category: "Vehicles",
        description: "Anvelopa de iarna Hankook W462, dimensiune 205/55R16 91H.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/48769/48768096/images/res_d51e1a6b0234695d14801cc0902009ea.jpg",
    },

    // ── Furniture ─────────────────────────────────────────────────────────
    {
        name: "Canapea extensibila 2 locuri, catifea Dark Grey, Model One",
        price: 1300,
        category: "Furniture",
        description: "Canapea extensibila 2 locuri 140x77x85 cm, tapitata catifea Dark Grey, Model One.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/101539/101538442/images/res_efcf77e24455afedcbe61c89ddd26fa0.jpg",
    },
    {
        name: "Canapea extensibila Axa, Gri, functie pat click-clack",
        price: 1206,
        category: "Furniture",
        description: "Canapea extensibila Axa, gri, 210x78x78, functie pat, sistem click-clack, arcuri Bonell.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/135528/135527705/images/res_d76f297ce8f3f38f4bd95d48a9960002.png",
    },
    {
        name: "Canapea extensibila Olivia, lada depozitare, Gri/Negru",
        price: 1570,
        category: "Furniture",
        description: "Canapea extensibila Olivia cu lada de depozitare, 220x70x88 cm, gri/negru.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/21608/21607513/images/res_1a21e9fd04d7b0322074a039598d44b0.jpg",
    },

    // ── Toys ──────────────────────────────────────────────────────────────
    {
        name: "LEGO DUPLO Cutie in forma de caramida 10913",
        price: 120,
        category: "Toys",
        description: "Set de constructie LEGO DUPLO, cutie in forma de caramida, 10913.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/27525/27524038/images/res_875a4fde4ad309efae131446afece783.jpg",
    },
    {
        name: "LEGO DUPLO Primul meu Tren cu numere 10954",
        price: 75,
        category: "Toys",
        description: "Set de constructie LEGO DUPLO, primul meu tren cu numere, 10954.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/36846/36845679/images/res_5ec1e34ecf298ba233ab7fdb762cb3b4.jpg",
    },
    {
        name: "LEGO Botanicals Margarete 11508",
        price: 60,
        category: "Toys",
        description: "Set de constructie LEGO Botanicals Margarete, 11508.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/108758/108757328/images/res_6b2cdfd538070246ad2fa24996e904bc.jpg",
    },
    {
        name: "LEGO Creator 3 in 1 Naveta spatiala 31134",
        price: 38,
        category: "Toys",
        description: "Set de constructie LEGO Creator 3 in 1, naveta spatiala, 31134.",
        imageUrl:
            "https://s13emagst.akamaized.net/products/91098/91097445/images/res_5d9da7c9d8f5787735f7b5e9f1f57fe6.jpg",
    },
];

async function main() {
    const inserted = await seedProductsForOwner(OWNER_USERNAME, products);
    console.log(`\nDone. Inserted ${inserted} product(s).`);
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

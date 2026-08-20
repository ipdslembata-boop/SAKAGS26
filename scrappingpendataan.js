(async () => {

    const API =
        "https://fasih-sm.bps.go.id/app/api/analytic/api/v2/assignment/report-progress-by-responsibility";

    const SURVEY_PERIOD_ID =
        "3fd42e0e-f82d-45af-a816-7e33829c56ec";

    const ROLE_ID =
        "7d485d10-f72a-48ee-ae85-ec04ec565749";

    const token = decodeURIComponent(
        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ""
    );

    if (!token) {
        console.error("XSRF TOKEN tidak ditemukan.");
        return;
    }

    // Gunakan size yang sama dengan request asli
    const SIZE = 5;

    let page = 0;
    let last = false;

    const allData = [];

    console.log("========================================");
    console.log("Mulai mengambil data...");
    console.log("========================================");

    while (!last) {

        const payload = {
            surveyPeriodId: SURVEY_PERIOD_ID,
            surveyRoleId: ROLE_ID,
            size: SIZE,
            page: page,
            search: "",
            target: "TARGET_ONLY",
            region: {
                region1Id: null,
                region2Id: null,
                region3Id: null,
                region4Id: null,
                region5Id: null,
                region6Id: null,
                region7Id: null,
                region8Id: null,
                region9Id: null,
                region10Id: null
            },
            regionSummaryLevel: 6
        };

        try {

            const response = await fetch(API, {
                method: "POST",
                credentials: "include",
                headers: {
                    "accept": "*/*",
                    "content-type": "application/json",
                    "x-xsrf-token": token
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error(`HTTP ${response.status} pada page ${page}`);
                break;
            }

            const json = await response.json();

            console.log(
                `Page ${json.data.page} | Data : ${json.data.content.length} | Last : ${json.data.last}`
            );

            allData.push(...json.data.content);

            last = json.data.last;

            page++;

            await new Promise(r => setTimeout(r, 250));

        } catch (err) {
            console.error(err);
            break;
        }

    }

    console.log("========================================");
    console.log(`Total Petugas : ${allData.length}`);
    console.log("========================================");

    console.table(allData);

    // ===============================
    // Flatten regionSummary
    // ===============================

    const rows = [];
    
    allData.forEach(user => {
    
        user.regionSummary.forEach(region => {
    
            const code = region.regionCode;
    
            const status = {
                DRAFT: 0,
                OPEN: 0,
                "SUBMITTED BY PPL": 0,
                "REJECTED BY PML": 0,
                "APPROVED BY PML": 0
            };
    
            region.statusBreakdown.forEach(item => {
                status[item.status] = item.count;
            });
    
            rows.push({
    
                PROVINSI: code.substring(0,2),
    
                KABUPATEN: code.substring(2,4),
    
                KECAMATAN: code.substring(4,7),
    
                DESA: code.substring(7,10),
    
                SLS: code.substring(10,14),
    
                SUBSLS: code.substring(14,16),
    
                EMAIL: user.email,
    
                USERNAME: user.username,
    
                ROLE: user.roleName,
    
                TOTAL_ASSIGNMENT: region.total,
    
                DRAFT: status["DRAFT"],
    
                OPEN: status["OPEN"],
    
                SUBMITTED: status["SUBMITTED BY PPL"],
    
                REJECTED: status["REJECTED BY PML"],

                APPROVED: status["APPROVED BY PML"]
    
            });
    
        });
    
    });
    
    console.table(rows);

    // ===============================
    // Download JSON
    // ===============================

    const blob = new Blob(
        [JSON.stringify(rows, null, 2)],
        { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "progress_pendataan.json";
    a.click();

})();

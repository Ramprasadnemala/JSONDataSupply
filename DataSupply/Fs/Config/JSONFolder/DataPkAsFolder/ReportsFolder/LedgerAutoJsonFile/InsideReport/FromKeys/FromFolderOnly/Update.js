let _ = require("lodash");

let CommonPullDataFromConfig = require("../../../PullDataFromFile/FromJson");
let CommonFromPushData = require("../../../PushDataFromFile/FromJson");

let MockFunc = require("../../../../../../../../../MockAllow.json");

let Update = async ({ DataPK, ItemName, voucher, BodyAsJson }) => {
    const LocalDataToUpdate = (({ FolderName, FromFolder }) => ({ FolderName, FromFolder }))(BodyAsJson);
    let LocalinDataPK = DataPK;
    let LocalReportName = ItemName;
    let LocalVouchersConsiderPk = parseInt(voucher);

    let LocalFromUpdate;
    let LocalReturnObject = { KTF: false };

    let LocalFromPullData = await CommonPullDataFromConfig.StartFunc({
        inDataPK: LocalinDataPK
    });

    if (LocalFromPullData.KTF === false) {
        LocalReturnObject.KReason = LocalFromPullData.KReason;
        return LocalReturnObject;
    };
    let LocalNewData = JSON.parse(JSON.stringify(LocalFromPullData.JsonData));

    if (LocalReportName in LocalNewData) {
        if ("VouchersConsider" in LocalNewData[LocalReportName]) {
            let LocalFilterObject = {};
            LocalFilterObject.pk = LocalVouchersConsiderPk;
            LocalFindColumnObject = _.find(LocalNewData[LocalReportName].VouchersConsider, LocalFilterObject);

            LocalFindColumnObject.FromFolder = LocalDataToUpdate.FromFolder;
            LocalFindColumnObject.FolderName = LocalDataToUpdate.FolderName;

            LocalFromUpdate = await CommonFromPushData.StartFunc({
                inDataPK: LocalinDataPK,
                inDataToUpdate: LocalNewData,
                inOriginalData: LocalFromPullData.JsonData
            });

            if (LocalFromUpdate.KTF) {
                LocalReturnObject.KTF = true;
            };

            return await LocalReturnObject;

        };
    };


    return await LocalReturnObject;
};
if (MockFunc.AllowMock) {
    if (MockFunc.MockKey === "PP") {
        Update({
            DataPK: MockFunc.DataPK,
            ItemName: "Purchases",
            voucher: "30",
            BodyAsJson: { FolderName: "Trans", FromFolder: false }

        }).then((PromiseData) => {
            console.log("PromiseData--", Object.keys(PromiseData));
        })

    };

};

module.exports = {
    Update
};
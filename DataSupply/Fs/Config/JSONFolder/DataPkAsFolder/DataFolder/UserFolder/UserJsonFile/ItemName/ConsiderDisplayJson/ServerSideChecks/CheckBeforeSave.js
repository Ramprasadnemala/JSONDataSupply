//let CommonDataSupply = require("../../../../../Items/PullData/FromDataFolder/PullFuncs/AsObject");
//let CommonDataSupply = require("../../Fs/Config/Folders/Files/Items/PullData/FromDataFolder/PullFuncs/AsObject");

//let CommonDataSupply = require("../../PullData/FromFolderFileItemName");

let LocalSwitchFunc = ({ inUserData, inColumnData, inObjectToInsert, inUserPK }) => {
    try {
        let LocalUserDataWithItemName = inUserData;
        let LocalRetTf = { KTF: true, KReason: "From ServerSideCheck" };
    
        switch (inColumnData.ServerSide.SaveCheck.Type) {
            case "Unique":
                for (const prop in LocalUserDataWithItemName) {
                    if (LocalUserDataWithItemName[prop][inColumnData.DataAttribute] !== null) {
                        if (LocalUserDataWithItemName[prop][inColumnData.DataAttribute] === inObjectToInsert[inColumnData.DataAttribute]) {
                            LocalRetTf.KTF = false;
                        };
                    }
                };

                if (LocalRetTf.KTF === false) {
                    LocalRetTf.KReason += `Unique, ${inColumnData.DataAttribute} `;
                };

                break;
            case "PresentInData":
                // {
                //     let LocalPresentInDataCheckReturn;
                //     let LocalFolderName = inColumnData.ServerSide.DefaultShowData.FolderName;
                //     let LocalFileName = inColumnData.ServerSide.DefaultShowData.FileName;
                //     let LocalItemName = inColumnData.ServerSide.DefaultShowData.ItemName;

                //     let LocalDataToCheck = CommonDataSupply.FromFolderAndFileAsObject({
                //         inFolderName: LocalFolderName,
                //         inFileNameWithExtension: LocalFileName,
                //         inItemName: LocalItemName, inDataPK: inUserPK
                //     });

                //     LocalPresentInDataCheckReturn = LocalSubFuncs.PresentInData.StartFunc({
                //         inDataToCheck: LocalDataToCheck,
                //         inColumnData, inObjectToInsert
                //     });
                //     //console.log("LocalPresentInDataCheckReturn : ", LocalPresentInDataCheckReturn);
                //     if (LocalPresentInDataCheckReturn.KTF === false) {
                //         LocalRetTf.KTF = false;
                //         LocalRetTf.KReason += `Unique, ${LocalPresentInDataCheckReturn.KReason} `;
                //     };
                // }

                break;
            default:
                break;
        };

        return LocalRetTf;
    } catch (error) {
        console.log("error : ", error);
    };
};

let LocalSubFuncs = {
    PresentInData: {
        StartFunc: ({ inDataToCheck, inColumnData, inObjectToInsert }) => {
            let LocalCheckColumnName = inColumnData.ServerSide.DefaultShowData.CheckColumnName;
            let LocalFromValueToCheck = inObjectToInsert[inColumnData.DataAttribute];
            let LocalRetTf = { KTF: false, KReason: "From PresentInData" };

            switch (LocalCheckColumnName) {
                case "pk":
                    if (LocalFromValueToCheck in inDataToCheck) {
                        LocalRetTf.KTF = true;
                    };

                    break;
                default:
                    {
                        let LocalReturnData = LocalSubFuncs.PresentInData.CommonFuns.ForOtherColumn({
                            inDataToCheck,
                            inFromValueToCheck: LocalFromValueToCheck,
                            inCheckColumnName: LocalCheckColumnName
                        });

                        if (LocalReturnData.KTF) {
                            LocalRetTf.KTF = true;
                        };

                        LocalRetTf.KReason += LocalReturnData.KReason;
                    }

                    break;
            };

            return LocalRetTf;
            //console.log("CheckColumnName : ", inColumnData.ServerSide.DefaultShowData.CheckColumnName);
        },
        CommonFuns: {
            ForOtherColumn: ({ inDataToCheck, inFromValueToCheck, inCheckColumnName }) => {
                let LocalRetTf = { KTF: false, KReason: `From PresentInData-Column other than ${inCheckColumnName}` };
                let LocalDataToCheckAsArray = Object.values(inDataToCheck);
                let LocalFindObject = LocalDataToCheckAsArray.find(element => {
                    return element[inCheckColumnName] === inFromValueToCheck;
                });
                //console.log("LocalFindObject : ", LocalFindObject, LocalFindObject !== undefined);
                if (LocalFindObject !== undefined) {
                    LocalRetTf.KTF = true;
                };

                return LocalRetTf;
            }
        }
    }
};

let ServerSideCheckAsync = async ({ inItemName, inUserData, inConfigTableColumns, inObjectToInsert, inDataPK }) => {
    let LocalConfigTableColumns = inConfigTableColumns;

    let LocalTableColumnsForSaveCheck;
    let LocalRetTf = { KTF: true, KReason: "From ServerSideCheck" };
    let LocalReturnFromSwitch;

    LocalTableColumnsForSaveCheck = LocalConfigTableColumns.filter(LoopItem => {
        if ("ServerSide" in LoopItem) {
            return LoopItem.ServerSide.SaveCheck.Validate;
        };
    });
    // console.log("LocalTableColumnsForSaveCheck : ", LocalConfigTableColumns, LocalTableColumnsForSaveCheck);
    LocalTableColumnsForSaveCheck.forEach((LoopItemColumn) => {
        LocalReturnFromSwitch = LocalSwitchFunc({
            inUserData: inUserData,
            inColumnData: LoopItemColumn,
            inObjectToInsert,
            inUserPK: inDataPK
        });

        //console.log("inObjectToInsert : ", LocalReturnFromSwitch);

        //  console.log("LocalReturnFromSwitch : ", LocalReturnFromSwitch);
        if (LocalReturnFromSwitch.KTF === false) {
            LocalRetTf.KTF = false;
            LocalRetTf.KReason += ` - ${LocalReturnFromSwitch.KReason}`;
        };
    });

    return await LocalRetTf;
};

module.exports = { ServerSideCheckAsync };

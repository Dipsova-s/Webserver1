using AngleWarnings;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using Moq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class AngleWarningsContentInputterTests : UnitTestBase
    {
        [TestCase]
        public void AngleWarningsTool_TryReadInputList_ShouldSucceed()
        {
            List<string> csvData = new List<string>
            {
                "Replace Field,Replace Field,R2020SP4,Order,FieldAOld,FieldBNew",
                "Replace Field,Replace Field,R2020,Order,FieldCOld,FieldDNew",
                "Replace Field,Replace Field,R2020,Order,FieldAOld,FieldBNew",
                "Replace class,Replace class,R2020SP5,Order,FieldCOld,FieldDNew",
                "Replace Field,Replace Field,R2020SP1,Order,FieldCOld,FieldDNew",
                "Replace Reference,Replace Reference,R2019,Order,FieldCOld,FieldDNew"
            };

            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);
            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
                    
            bool succeeded = contentInputter.TryReadInputList();

            Assert.IsTrue(succeeded);

            // Check order of items
            int currentOrder = 0;
            
            for (int i = 0; i < contentInputter.ContentInputList.Count; i++)
            {
                Assert.GreaterOrEqual(contentInputter.ContentInputList[i].Order, currentOrder);
            }

            Assert.IsNotNull(contentInputter.GetInputBySolutionClassAndField("unsupported_display_field", "Order", "FieldAOld", null));
            Assert.IsNotNull(contentInputter.GetInputBySolutionClassAndField("unsupported_display_field", "Order", "FieldCOld", null));
            Assert.IsNull(contentInputter.GetInputBySolutionClassAndField("unsupported_display_field", "Material", "FieldCOld", null));
        }

        [TestCase]
        public void AngleWarningsTool_ReadInputListFromDisk_Fails()
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Throws<FileNotFoundException>();

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);

            Assert.IsFalse(contentInputter.TryReadInputList());
        }

        [TestCase]
        public void AngleWarningsTool_ReadInputListFromDisk_IgnoreUnsupported()
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();

            List<string> csvData = new List<string>
            {
                "Replace field,Replace field,R2020SP4,D,E,F",
                "Add filters,Unsupported,R2020SP4,D,E,F"
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            Assert.IsTrue(contentInputter.TryReadInputList());
            Assert.AreEqual(contentInputter.ContentInputList.Count, 1);
        }

        [TestCase("Replace field,Replace field,C,D,E")]
        [TestCase("Replace field,Replace field,C,D")]

        public void AngleWarningsTool_TryReadInputList_InvalidNrColumns_ShouldFail(string inputColumns)
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();

            List<string> csvData = new List<string>
            {
                inputColumns
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            Assert.IsFalse(contentInputter.TryReadInputList());
        }

        [TestCase("unsupported_display_field","Order", "Field1", "Field4")]
        [TestCase("unsupported_start_object", "Class1", "Class1", "Class4")]
        public void AngleWarningsTool_Recursiveness_ShouldSucceed(string warning, string objectClass, string oldField, string expectedNewField)
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();

            List<string> csvData = new List<string>
            {
                "Replace field,Replace field,R2020SP3,Order,Field3,Field4",
                "Replace field,Replace field,R2020SP2,Order,Field2,Field3",
                "Replace field,Replace field,R2020SP1,Order,Field1,Field2",

                "Replace class,Replace class,R2020SP3,Class3,Class3,Class4",
                "Replace class,Replace class,R2020SP2,Class2,Class2,Class3",
                "Replace class,Replace class,R2020SP1,Class1,Class1,Class2",
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            Assert.IsTrue(contentInputter.TryReadInputList());

            AngleWarningsContentInput contentInput = contentInputter.GetInputBySolutionClassAndField(warning, objectClass, oldField, null);

            Assert.AreEqual(oldField, contentInput.FieldOrClassToReplace);
            Assert.AreEqual(expectedNewField, contentInput.NewFieldOrClass);
        }

        [TestCase]
        public void AngleWarningsTool_GetInputBySolutionClassAndField_ShouldSucceed()
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();

            List<string> csvData = new List<string>
            {
                "Replace Field,Replace Field,R2020SP5,Order,Field1,Field2",
                "Replace class,Replace class,R2020SP5,Order1,Order1,Order2",
                "Replace reference,Replace reference,R2020SP5,Order1,Order1,Order2",
                "Replace Field,Replace Field,R2020SP1,Order,Field3,Field4",
                "Replace reference,Replace reference,R2020SP1,BillingDocumentItem,Test_ref_Payer,Payer",
                "Replace sublist,Replace sublist,R2020SP1,BillingDocumentItem,Test_ref_Payers,Payers",
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            contentInputter.TryReadInputList();

            AngleWarningsContentInput contentInput = contentInputter.GetInputBySolutionClassAndField("unsupported_display_field", "Order", "Field1", null);

            Assert.AreEqual(WarningFix.ReplaceField, contentInput.Fix);
            Assert.AreEqual("R2020SP5", contentInput.Version);
            Assert.AreEqual("Order", contentInput.ObjectClass);
            Assert.AreEqual("Field1", contentInput.FieldOrClassToReplace);
            Assert.AreEqual("Field2", contentInput.NewFieldOrClass);

            contentInput = contentInputter.GetInputBySolutionClassAndField("unsupported_start_object", "Order1", "Order1", null);

            Assert.AreEqual(WarningFix.ReplaceClass, contentInput.Fix);
            Assert.AreEqual("R2020SP5", contentInput.Version);
            Assert.AreEqual("Order1", contentInput.ObjectClass);
            Assert.AreEqual("Order1", contentInput.FieldOrClassToReplace);
            Assert.AreEqual("Order2", contentInput.NewFieldOrClass);

            contentInput = contentInputter.GetInputBySolutionClassAndField("unsupported_jump", "Order1", "Order1", "Order1");

            Assert.AreEqual(WarningFix.ReplaceReference, contentInput.Fix);
            Assert.AreEqual("R2020SP5", contentInput.Version);
            Assert.AreEqual("Order1", contentInput.ObjectClass);
            Assert.AreEqual("Order1", contentInput.FieldOrClassToReplace);
            Assert.AreEqual("Order2", contentInput.NewFieldOrClass);

            contentInput = contentInputter.GetInputBySolutionClassAndField("unsupported_display_field", "BillingDocumentItem", "Test_ref_Payer", null);

            Assert.AreEqual(WarningFix.ReplaceReference, contentInput.Fix);
            Assert.AreEqual("R2020SP1", contentInput.Version);
            Assert.AreEqual("BillingDocumentItem", contentInput.ObjectClass);
            Assert.AreEqual("Test_ref_Payer", contentInput.FieldOrClassToReplace);
            Assert.AreEqual("Payer", contentInput.NewFieldOrClass);

            contentInput = contentInputter.GetInputBySolutionClassAndField("unsupported_jump", "BillingDocumentItem", null, "Test_ref_Payer");

            Assert.AreEqual(WarningFix.ReplaceReference, contentInput.Fix);
            Assert.AreEqual("R2020SP1", contentInput.Version);
            Assert.AreEqual("BillingDocumentItem", contentInput.ObjectClass);
            Assert.AreEqual("Test_ref_Payer", contentInput.FieldOrClassToReplace);
            Assert.AreEqual("Payer", contentInput.NewFieldOrClass);

            contentInput = contentInputter.GetInputBySolutionClassAndField("unsupported_jump", "BillingDocumentItem", null, "Test_ref_Payers");

            Assert.AreEqual(WarningFix.ReplaceSublist, contentInput.Fix);
            Assert.AreEqual("R2020SP1", contentInput.Version);
            Assert.AreEqual("BillingDocumentItem", contentInput.ObjectClass);
            Assert.AreEqual("Test_ref_Payers", contentInput.FieldOrClassToReplace);
            Assert.AreEqual("Payers", contentInput.NewFieldOrClass);
        }

        [TestCase]
        public void GetSolveItem()
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();

            List<string> csvData = new List<string>
            {
                "Replace reference,Replace reference,R2020SP1,BillingDocumentItem,Reference_old_2,BillingDocumentHeader",
                "Replace Field,Replace Field,R2020SP1,BillingDocumentHeader,Display_old_1,DocumentCurrency",
                "Replace Field,Replace Field,R2020SP1,BillingDocumentHeader,Display_old_2,CreationDate"
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            contentInputter.TryReadInputList();

            AngleWarningsContentInput contentInput = contentInputter.GetSolveItem("unsupported_display_field", "BillingDocumentItem", "Reference_old_2__Display_old_1", null);
            
           
            Assert.AreEqual("BillingDocumentHeader__DocumentCurrency", contentInput.NewFieldOrClass);
        }


        [TestCase]
        public void Adeed()
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();

            List<string> csvData = new List<string>
            {
                "Replace Field,Replace Field,R2020SP1,Material,Material123,Material"
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            contentInputter.TryReadInputList();

            AngleWarningsContentInput contentInput = contentInputter.GetSolveItem("unsupported_display_field", "PurchaseOrderLine", "Material__Material123", null);


            Assert.AreEqual("Material__Material", contentInput.NewFieldOrClass);
        }


        [TestCase]
        public void AngleWarningsTool_CountFieldMatches()
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();

            List<string> csvData = new List<string>
            {
                "Replace class,Replace class,R2020,InternalOrder,InternalOrder,WorkOrder",
                "Replace field,Replace field,R2020,Material,Material1,Material2",
                "Replace sublist,Replace sublist,R2020,BillingDocumentItem,Test_ref_Payers,Payers",
                "Replace reference,Replace reference,R2020,BillingDocumentItem,Test_ref_Payer,Payer",
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            Assert.IsTrue(contentInputter.TryReadInputList());

            List<AngleWarningSecondLevelViewmodel> secondLevelList = new List<AngleWarningSecondLevelViewmodel>();

            AngleWarningsViewModel angleWarningsViewModel = new AngleWarningsViewModel();

            secondLevelList.Add(GetSecondLevelWarning(1, "Material", "Material1", null));
            secondLevelList.Add(GetSecondLevelWarning(1, "Order", "Material__Material1", null));

            JObject result = JObject.FromObject(new
            {
                summary = "",
                data = secondLevelList,
                Object = "Order"
            });

            Assert.IsTrue(contentInputter.CountFieldMatches("unsupported_display_field", result) == 2);

            secondLevelList.Clear();
            secondLevelList.Add(GetSecondLevelWarning(1, "BillingDocumentItem", null, "Test_ref_Payers"));
            secondLevelList.Add(GetSecondLevelWarning(1, "BillingDocumentItem", null, "Test_ref_Payer"));
 

            result = JObject.FromObject(new
            {
                summary = "",
                data = secondLevelList,
                Object = "Order"
            });


            Assert.IsTrue(contentInputter.CountFieldMatches("unsupported_jump", result) == 2);

            secondLevelList.Clear();
            secondLevelList.Add(GetSecondLevelWarning(1, "BillingDocumentItem", "Test_ref_Payer__Customer", null));


            result = JObject.FromObject(new
            {
                summary = "",
                data = secondLevelList,
                Object = "Order"
            });

            Assert.IsTrue(contentInputter.CountFieldMatches("unsupported_display_field", result) == 1);

            secondLevelList.Clear();
            secondLevelList.Add(GetSecondLevelWarning(1, "InternalOrder", null, null));

            result = JObject.FromObject(new
            {
                summary = "",
                data = secondLevelList,
                Object = "InternalOrder"
            });
            int i = contentInputter.CountFieldMatches("unsupported_start_object", result);
            Assert.IsTrue(contentInputter.CountFieldMatches("unsupported_start_object", result) == 1);
        }

        [TestCase]
        public void AngleWarningsTool_Jump_CountFieldMatches()
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();

            List<string> csvData = new List<string>
            {
                "Replace reference,Replace reference,R2020,PurchaseOrderScheduleLine,AddressDVV,Address"
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            List<AngleWarningSecondLevelViewmodel> secondLevelList = new List<AngleWarningSecondLevelViewmodel>();

            AngleWarningsViewModel angleWarningsViewModel = new AngleWarningsViewModel();

            secondLevelList.Add(GetSecondLevelWarning(2, "PurchaseOrderScheduleLine", null, "AddressDVV"));

            JObject result = JObject.FromObject(new
            {
                summary = "",
                data = secondLevelList,
                Object = "Order"
            });

            contentInputter.TryReadInputList();

            Assert.IsTrue(contentInputter.CountFieldMatches("unsupported_jump", result) == 2);
        }

        private AngleWarningSecondLevelViewmodel GetSecondLevelWarning(int count, string objectClass, string fieldOrClass, string jump)
        {
            return new AngleWarningSecondLevelViewmodel
            {
                Count = count,
                Object = objectClass,
                Field = fieldOrClass,
                Jump = jump
            };
        }

    }
}
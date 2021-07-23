using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using Moq;
using NUnit.Framework;
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

            Assert.IsTrue(contentInputter.GetSolveItem("unsupported_display_field", "Order", "FieldAOld", null).Fix != WarningFix.NoFixAvailable);
            Assert.IsTrue(contentInputter.GetSolveItem("unsupported_display_field", "Order", "FieldCOld", null).Fix != WarningFix.NoFixAvailable);
            Assert.IsTrue(contentInputter.GetSolveItem("unsupported_display_field", "Material", "FieldCOld", null).Fix == WarningFix.NoFixAvailable);
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

        [TestCase]
        public void GetSolveItem_ShouldReturnNoFixAvailable()
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();

            List<string> csvData = new List<string>
            {
                "Replace field,Replace field,R2020SP3,Order,Field1,Field2",
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            Assert.IsTrue(contentInputter.TryReadInputList());

            AngleWarningsContentInput solveItem = contentInputter.GetSolveItem("unsupported_start_object", "Batch", "Batch", null);
            Assert.AreEqual(solveItem.Fix, WarningFix.NoFixAvailable);

            solveItem = contentInputter.GetSolveItem("unsupported_start_object", "Batch", "Batch", "Jump");
            Assert.AreEqual(solveItem.Fix, WarningFix.NoFixAvailable);

            solveItem = contentInputter.GetSolveItem("unsupported_display_field", "Batch", "Batch__Field__Field", null);
            Assert.AreEqual(solveItem.Fix, WarningFix.NoFixAvailable);
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

            AngleWarningsContentInput contentInput = contentInputter.GetSolveItem(warning, objectClass, oldField, null);

            Assert.AreEqual(oldField, contentInput.FieldOrClassToReplace);
            Assert.AreEqual(expectedNewField, contentInput.NewFieldOrClass);
        }

        [TestCase]
        public void AngleWarningsTool_GetSolveItem_ShouldSucceed()
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
                "Replace Field,Replace Field,R2020SP1,Material,Material123,Material"
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            contentInputter.TryReadInputList();

            ItemSolver solveItem = contentInputter.GetSolveItem("unsupported_display_field", "Order", "Field1", null);

            Assert.AreEqual(WarningFix.ReplaceField, solveItem.Fix);
            Assert.AreEqual("Order", solveItem.ObjectClass);
            Assert.AreEqual("Field1", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Field2", solveItem.NewFieldOrClass);

            solveItem = contentInputter.GetSolveItem("unsupported_start_object", "Order1", "Order1", null);

            Assert.AreEqual(WarningFix.ReplaceClass, solveItem.Fix);
            Assert.AreEqual("Order1", solveItem.ObjectClass);
            Assert.AreEqual("Order1", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Order2", solveItem.NewFieldOrClass);

            solveItem = contentInputter.GetSolveItem("unsupported_jump", "Order1", "Order1", "Order1");

            Assert.AreEqual(WarningFix.ReplaceJump, solveItem.Fix);
            Assert.AreEqual("Order1", solveItem.ObjectClass);
            Assert.AreEqual("Order1", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Order2", solveItem.NewFieldOrClass);

            solveItem = contentInputter.GetSolveItem("unsupported_display_field", "BillingDocumentItem", "Test_ref_Payer__testField", null);

            Assert.AreEqual(WarningFix.ReplaceField, solveItem.Fix);
            Assert.AreEqual("BillingDocumentItem", solveItem.ObjectClass);
            Assert.AreEqual("Test_ref_Payer__testField", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Payer__testField", solveItem.NewFieldOrClass);

            solveItem = contentInputter.GetSolveItem("unsupported_jump", "BillingDocumentItem", null, "Test_ref_Payer");

            Assert.AreEqual(WarningFix.ReplaceJump, solveItem.Fix);
            Assert.AreEqual("BillingDocumentItem", solveItem.ObjectClass);
            Assert.AreEqual("Test_ref_Payer", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Payer", solveItem.NewFieldOrClass);

            solveItem = contentInputter.GetSolveItem("unsupported_jump", "BillingDocumentItem", null, "Test_ref_Payers");

            Assert.AreEqual(WarningFix.ReplaceJump, solveItem.Fix);
            Assert.AreEqual("BillingDocumentItem", solveItem.ObjectClass);
            Assert.AreEqual("Test_ref_Payers", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Payers", solveItem.NewFieldOrClass);

            solveItem = contentInputter.GetSolveItem("unsupported_display_field", "PurchaseOrderLine", "Material__Material123", null);
            Assert.AreEqual("Material__Material", solveItem.NewFieldOrClass);
        }

        [TestCase]
        public void AngleWarningsTool_GetSolveItem_ShouldSucceed_2()
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
        [Ignore] // Not yet implemented, appserver cant handle two base classes
        public void GetSolveItem_TwoBaseClasses()
        {
            Mock<IAngleWarningsFileReader> fileReader = new Mock<IAngleWarningsFileReader>();

            List<string> csvData = new List<string>
            {
                "Replace Reference,Replace Reference,R2020SP1,BillingDocumentItem,Reference_old_1,Customer",
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileReader.Object);
            fileReader.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            contentInputter.TryReadInputList();

            AngleWarningsContentInput contentInput = contentInputter.GetSolveItem("unsupported_display_field", "BillingDocumentHeader,BillingDocumentItem", "Reference_old_1__Display_old_1", null);

            Assert.AreEqual("Customer__Display_old_1", contentInput.NewFieldOrClass);
        }
    }
}
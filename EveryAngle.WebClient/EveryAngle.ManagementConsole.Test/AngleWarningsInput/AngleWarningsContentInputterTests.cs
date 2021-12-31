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
        public void AWT_ContentInputter_Initialize()
        {
            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();
            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, classReferencesManager.Object);

            contentInputter.Initialize(@"\fieldsourcesuri", @"\classesuri");
        }

        [TestCase]
        public void AWT_TryReadInputList_ShouldSucceed()
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

            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();
            fileManager.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);
            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, classReferencesManager.Object);
                    
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
        public void AWT_ReadInputListFromDisk_ShouldFail()
        {
            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();
            fileManager.Setup(x => x.ReadContentInputExcelFileFromDisk()).Throws<FileNotFoundException>();

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, classReferencesManager.Object);

            Assert.IsFalse(contentInputter.TryReadInputList());
        }

        [TestCase]
        public void AWT_ReadInputListFromDisk_IgnoreUnsupported()
        {
            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();

            List<string> csvData = new List<string>
            {
                "Replace field,Replace field,R2020SP4,D,E,F",
                "Add filters,Unsupported,R2020SP4,D,E,F"
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, classReferencesManager.Object);
            fileManager.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            Assert.IsTrue(contentInputter.TryReadInputList());
            Assert.AreEqual(contentInputter.ContentInputList.Count, 1);
        }

        [TestCase("Replace field,Replace field,C,D,E")]
        [TestCase("Replace field,Replace field,C,D")]

        public void AWT_TryReadInputList_InvalidNrColumns_ShouldFail(string inputColumns)
        {
            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();

            List<string> csvData = new List<string>
            {
                inputColumns
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, classReferencesManager.Object);
            fileManager.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            Assert.IsFalse(contentInputter.TryReadInputList());
        }

        [TestCase]
        public void AWT_GetSolveItem_ShouldReturnNoFixAvailable()
        {
            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();

            List<string> csvData = new List<string>
            {
                "Replace field,Replace field,R2020SP3,Order,Field1,Field2",
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, classReferencesManager.Object);
            fileManager.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

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
        public void AWT_Recursiveness_ShouldSucceed(string warning, string objectClass, string oldField, string expectedNewField)
        {
            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();

            List<string> csvData = new List<string>
            {
                "Replace field,Replace field,R2020SP3,Order,Field3,Field4",
                "Replace field,Replace field,R2020SP2,Order,Field2,Field3",
                "Replace field,Replace field,R2020SP1,Order,Field1,Field2",

                "Replace class,Replace class,R2020SP3,Class3,Class3,Class4",
                "Replace class,Replace class,R2020SP2,Class2,Class2,Class3",
                "Replace class,Replace class,R2020SP1,Class1,Class1,Class2",
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, classReferencesManager.Object);
            fileManager.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            Assert.IsTrue(contentInputter.TryReadInputList());

            AngleWarningsContentInput contentInput = contentInputter.GetSolveItem(warning, objectClass, oldField, null);

            Assert.AreEqual(oldField, contentInput.FieldOrClassToReplace);
            Assert.AreEqual(expectedNewField, contentInput.NewFieldOrClass);
        }

        public AngleWarningsContentInputter GetMockedExcelListReader()
        {
            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();

            List<string> csvData = new List<string>
            {
                "Replace class,Replace class,R2020SP5,CustomerNew,CustomerNew,Customer",
                "Replace class,Replace class,R2020SP4,CustomerOld,CustomerOld,CustomerNew",

                "Replace Field,Replace Field,R2020SP5,Customer,NameOld,Name",
                "Replace Field,Replace Field,R2020SP5,Customer,Address__City,City",

                "Replace Field,Replace Field,R2020SP5,Customer,City3,Address__City2",
                "Replace Field,Replace Field,R2020SP4,Customer,City2,City3",
                "Replace Field,Replace Field,R2020SP1,Customer,City,City2",

                "Replace Reference,Replace Reference,R2020SP5,Customer,AddressOld,Address",

                "Replace Sublist,Replace Sublist,R2020SP5,PurchaseOrderLine,Controllings,ControllingAreas",
                "Replace Sublist,Replace Sublist,R2020SP4,PurchaseOrderLine,ControllingAreaOlds,Controllings",

                "Replace Reference,Replace Reference,R2020SP5,Customer,Address,Self",
                "Remove column,Remove column,R2020SP5,WorkOrder,SomeFieldToBeDeleted",
                "Replace Field,Replace Field,R2020SP5,WorkOrder,PRCTR,ProfitCenter__ProfitCenterID"
            };

            fileManager.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, classReferencesManager.Object);

            contentInputter.TryReadInputList();

            return contentInputter;
        }

        [TestCase]
        public void AWT_SolveItem_ReplaceClass()
        {
            // Prepare
            AngleWarningsContentInputter contentInputter = GetMockedExcelListReader();
                       
            // Act
            ItemSolver solveItem = contentInputter.GetSolveItem("unsupported_start_object", "CustomerOld", "CustomerOld", null);

            // Assert
            Assert.AreEqual(WarningFix.ReplaceClass, solveItem.Fix);
            Assert.AreEqual("CustomerOld", solveItem.ObjectClass);
            Assert.AreEqual("CustomerOld", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Customer", solveItem.NewFieldOrClass);
        }

        [TestCase] 
        public void AWT_SolveItem_ReplaceField()
        {
            // Prepare
            AngleWarningsContentInputter contentInputter = GetMockedExcelListReader();

            // Act
            ItemSolver solveItem = contentInputter.GetSolveItem("unsupported_display_field", "Customer", "NameOld", null);

            // Assert
            Assert.AreEqual(WarningFix.ReplaceField, solveItem.Fix);
            Assert.AreEqual("Customer", solveItem.ObjectClass);
            Assert.AreEqual("NameOld", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Name", solveItem.NewFieldOrClass);
        }

        [TestCase]
        public void AWT_SolveItem_ReplaceField_ReplaceReferenceWithField()
        {
            // Prepare
            AngleWarningsContentInputter contentInputter = GetMockedExcelListReader();

            // Act
            ItemSolver solveItem = contentInputter.GetSolveItem("unsupported_display_field", "Customer", "Address__City", null);

            // Assert
            Assert.AreEqual(WarningFix.ReplaceField, solveItem.Fix);
            Assert.AreEqual("Customer", solveItem.ObjectClass);
            Assert.AreEqual("Address__City", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("City", solveItem.NewFieldOrClass);
        }

        [TestCase]
        public void AWT_SolveItem_ReplaceField_ReplaceFieldWithReferencedField()
        {
            // Prepare
            AngleWarningsContentInputter contentInputter = GetMockedExcelListReader();

            // Act
            ItemSolver solveItem = contentInputter.GetSolveItem("unsupported_display_field", "Customer", "City", null);

            // Assert
            Assert.AreEqual(WarningFix.ReplaceField, solveItem.Fix);
            Assert.AreEqual("Customer", solveItem.ObjectClass);
            Assert.AreEqual("City", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Address__City2", solveItem.NewFieldOrClass);
        }

        [TestCase]
        public void AWT_SolveItem_ReplaceReference_ReplaceReference()
        {
            // Prepare
            AngleWarningsContentInputter contentInputter = GetMockedExcelListReader();

            // Act
            ItemSolver solveItem = contentInputter.GetSolveItem("unsupported_display_field", "Customer", "AddressOld__Country", null);

            // Assert
            Assert.AreEqual(WarningFix.ReplaceField, solveItem.Fix);
            Assert.AreEqual("Customer", solveItem.ObjectClass);
            Assert.AreEqual("AddressOld__Country", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Address__Country", solveItem.NewFieldOrClass);

            // Act
            solveItem = contentInputter.GetSolveItem("unsupported_display_field", "Operation", "WorkOrder__PRCTR", null);

            // Assert
            Assert.AreEqual(WarningFix.ReplaceField, solveItem.Fix);
            Assert.AreEqual("Operation", solveItem.ObjectClass);
            Assert.AreEqual("WorkOrder__PRCTR", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("ProfitCenter__ProfitCenterID", solveItem.NewFieldOrClass);
        }

        [TestCase]
        public void AWT_SolveItem_ReplaceReference_ReplaceReferenceWithSelf()
        {
            // Prepare
            AngleWarningsContentInputter contentInputter = GetMockedExcelListReader();

            // Act
            ItemSolver solveItem = contentInputter.GetSolveItem("unsupported_display_field", "Customer", "Address__Name", null);

            // Assert
            Assert.AreEqual(WarningFix.ReplaceField, solveItem.Fix);
            Assert.AreEqual("Customer", solveItem.ObjectClass);
            Assert.AreEqual("Address__Name", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Name", solveItem.NewFieldOrClass);
        }

        [TestCase]
        public void AWT_SolveItem_ReplaceReference_ReplaceJump()
        {
            // Prepare
            AngleWarningsContentInputter contentInputter = GetMockedExcelListReader();

            // Act
            ItemSolver solveItem = contentInputter.GetSolveItem("unsupported_jump", "Customer", null, "AddressOld");

            // Assert
            Assert.AreEqual(WarningFix.ReplaceJump, solveItem.Fix);
            Assert.AreEqual("Customer", solveItem.ObjectClass);
            Assert.AreEqual("AddressOld", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("Address", solveItem.NewFieldOrClass);
        }

        [TestCase]
        public void AWT_SolveItem_ReplaceReference_ReplaceJump_Sublist()
        {
            // Prepare
            AngleWarningsContentInputter contentInputter = GetMockedExcelListReader();

            // Act
            ItemSolver solveItem = contentInputter.GetSolveItem("unsupported_jump", "PurchaseOrderLine", null, "ControllingAreaOlds");

            // Assert
            Assert.AreEqual(WarningFix.ReplaceJump, solveItem.Fix);
            Assert.AreEqual("PurchaseOrderLine", solveItem.ObjectClass);
            Assert.AreEqual("ControllingAreaOlds", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("ControllingAreas", solveItem.NewFieldOrClass);
        }
       
        [TestCase]
        public void AWT_SolveItem_RemoveColumn()
        {
            // Prepare
            AngleWarningsContentInputter contentInputter = GetMockedExcelListReader();

            // Act
            ItemSolver solveItem = contentInputter.GetSolveItem("unsupported_display_field", "WorkOrder", "SomeFieldToBeDeleted", null);

            // Assert
            Assert.AreEqual(WarningFix.RemoveColumn, solveItem.Fix);
            Assert.AreEqual("WorkOrder", solveItem.ObjectClass);
            Assert.AreEqual("SomeFieldToBeDeleted", solveItem.FieldOrClassToReplace);
            Assert.AreEqual("", solveItem.NewFieldOrClass);
        }

        [TestCase]
        public void AWT_SolveItem_FieldChangedInOriginalClass()
        {
            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();
            classReferencesManager.Setup(x => x.GetReferencedClass(It.IsAny<string>())).Returns("Customer");

            List<string> csvData = new List<string>
            {
                "Replace Field,Replace Field,R2020SP1,Customer,Name,NewName"
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, classReferencesManager.Object);
            fileManager.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            contentInputter.TryReadInputList();

            AngleWarningsContentInput contentInput = contentInputter.GetSolveItem("unsupported_display_field", "BillingDocumentItem", "Payer__Name", null);
            Assert.AreEqual("Payer__NewName", contentInput.NewFieldOrClass);
        }

        [TestCase]
        public void AWT_GetSolveItem_InvalidWarningsShouldReturnNoFixAvailable()
        {
            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();
            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, classReferencesManager.Object);

            AngleWarningsContentInput contentInput = contentInputter.GetSolveItem("invalid_display_field", "BillingDocumentItem", "Payer__Name", null);
            Assert.AreEqual(WarningFix.NoFixAvailable, contentInput.Fix);
        }

        [TestCase]
        [Ignore] // Not yet implemented, appserver cant handle two base classes
        public void AWT_GetSolveItem_TwoBaseClasses()
        {
            Mock<IAngleWarningsFileManager> fileManager = new Mock<IAngleWarningsFileManager>();

            List<string> csvData = new List<string>
            {
                "Replace Reference,Replace Reference,R2020SP1,BillingDocumentItem,Reference_old_1,Customer",
            };

            AngleWarningsContentInputter contentInputter = new AngleWarningsContentInputter(fileManager.Object, null);
            fileManager.Setup(x => x.ReadContentInputExcelFileFromDisk()).Returns(csvData);

            contentInputter.TryReadInputList();

            AngleWarningsContentInput contentInput = contentInputter.GetSolveItem("unsupported_display_field", "BillingDocumentHeader,BillingDocumentItem", "Reference_old_1__Display_old_1", null);

            Assert.AreEqual("Customer__Display_old_1", contentInput.NewFieldOrClass);
        }
    }
}
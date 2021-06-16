﻿using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using NUnit.Framework;
using System;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class AngleWarningsContentInputTests : UnitTestBase
    {
        [TestCase("R2020", "Order", (int)EAVersion.R2020)]
        [TestCase("R2020SP2", "Order", (int)EAVersion.R2020SP2)]
        [TestCase("R2020SP5", "Order", (int)EAVersion.R2020SP5)]
        public void AngleWarningsTool_ContentInput_Order(string version, string objectClass, int expectedOrder)
        {
            WarningFix fix = WarningFix.ReplaceField;
            string fieldToReplace = "FieldDummy";
            string newField = "NewFieldDummy";

            AngleWarningsContentInput angleWarningsContentInput = new AngleWarningsContentInput(fix, version, objectClass, fieldToReplace, newField);

            Assert.AreEqual(expectedOrder, angleWarningsContentInput.Order);
            Assert.AreEqual(fieldToReplace, angleWarningsContentInput.FieldOrClassToReplace);
            Assert.AreEqual(newField, angleWarningsContentInput.NewFieldOrClass);
        }

        [TestCase]
        public void AngleWarningsTool_ContentInput_GetClassOrFieldToReplaceString()
        {
            string objectClass = "Order";
            string fieldToReplace = "FieldA";
            string newField = "FieldB";

            string expectedOtherObject = "Order__FieldA";

            string expectedSameObjectNewField = "FieldB";
            string expectedOtherObjectNewField = "Order__FieldB";

            AngleWarningsContentInput angleWarningsContentInput = new AngleWarningsContentInput(WarningFix.ReplaceField, "R2020", objectClass, fieldToReplace, newField);

            Assert.AreEqual(expectedOtherObject, angleWarningsContentInput.GetClassOrFieldToReplaceString());
            Assert.AreEqual(expectedSameObjectNewField, angleWarningsContentInput.GetNewFieldString(objectClass));
            Assert.AreEqual(expectedOtherObjectNewField, angleWarningsContentInput.GetNewFieldString("Something"));
        }


        [TestCase]
        public void AngleWarningsTool_ContentInput_GetNewFieldString()
        {
            string objectClass = "Order";
            string fieldToReplace = "FieldA";
            string newField = "FieldB";

            string expectedSameObjectNewField = "FieldB";
            string expectedOtherObjectNewField = "Order__FieldB";

            AngleWarningsContentInput angleWarningsContentInput = new AngleWarningsContentInput(WarningFix.ReplaceField, "R2020", objectClass, fieldToReplace, newField);

            Assert.AreEqual(expectedSameObjectNewField, angleWarningsContentInput.GetNewFieldString(objectClass));
            Assert.AreEqual(expectedOtherObjectNewField, angleWarningsContentInput.GetNewFieldString("Something"));
        }

        [TestCase(WarningFix.ReplaceField, "", "Order", "FieldA", "FieldB")]
        [TestCase(WarningFix.ReplaceField, "R2020SP4", "", "FieldA", "FieldB")]
        [TestCase(WarningFix.ReplaceField, "R2020SP4", "Order", "", "FieldB")]
        [TestCase(WarningFix.ReplaceField, "R2020SP4", "Order", "FieldA", "")]
        public void AngleWarningsTool_ContentInput_NoParameterGiven_ShouldThrowException(WarningFix fix, string version, string objectClass, string fieldToReplace, string newField)
        {
            Assert.That(() => new AngleWarningsContentInput(fix, version, objectClass, fieldToReplace, newField), Throws.TypeOf<ArgumentException>());
        }

        [TestCase]
        public void AngleWarningsTool_ContentInput_InvalidVersion_ShouldThrowException()
        {
            string version = "WrongVersion";
            string objectClass = "Order";
            string fieldToReplace = "FieldA";
            string newField = "FieldB";

            Assert.That(() => new AngleWarningsContentInput(WarningFix.ReplaceField, version, objectClass, fieldToReplace, newField), Throws.TypeOf<InvalidOperationException>());
        }

        [TestCase(WarningFix.ReplaceField, "unsupported_display_field")]
        [TestCase(WarningFix.ReplaceField, "unsupported_aggregation_field")]
        [TestCase(WarningFix.ReplaceField, "unsupported_grouping_field")]
        [TestCase(WarningFix.ReplaceField, "unsupported_sorting_field")]
        [TestCase(WarningFix.ReplaceField, "unsupported_filter_field")]
        [TestCase(WarningFix.ReplaceClass, "unsupported_start_object")]
        [TestCase(WarningFix.ReplaceReference, "unsupported_display_field")]
        [TestCase(WarningFix.ReplaceSublist, "unsupported_jump")]
        public void InputContentMapper_ShouldReturnTrue(WarningFix warningFix, string solution)
        {
            Assert.IsTrue(InputContentMapper.Maps(warningFix, solution));
        }

        [TestCase(WarningFix.ReplaceField, "unsupported_start_object")]
        [TestCase(WarningFix.ReplaceReference, "unsupported_start_object")]
        [TestCase(WarningFix.ReplaceClass, "unsupported_display_field")]
        [TestCase(WarningFix.NotSupportedMethod, "unsupported_start_object")]
        public void InputContentMapper_ShouldReturnFalse(WarningFix warningFix, string solution)
        {
            Assert.IsFalse(InputContentMapper.Maps(warningFix, solution));
        }
    }
}
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Test.AngleWarningsInput
{
    public class ClassReferencesManagerTests : UnitTestBase
    {
        [TestCase]
        public void GetReferencedClass_Succeeds()
        {
            List<FieldSourceViewModel> fieldSources = new List<FieldSourceViewModel>();
            FieldSourceViewModel fieldSourceViewModel = new FieldSourceViewModel
            {
                id = "Payer",
                class_uri = @"classes\145"
            };

            fieldSources.Add(fieldSourceViewModel);

            ClassViewModel customerClass = new ClassViewModel
            {
                id = "Customer"
            };

            modelService.Setup(x => x.GetFieldSources(It.IsAny<string>())).Returns(fieldSources);
            modelService.Setup(x => x.GetClass(@"classes\145")).Returns(customerClass);

            ClassReferencesManager classReferencesManager = new ClassReferencesManager(modelService.Object);
            classReferencesManager.Initialize("", "");

            Assert.AreEqual("Customer", classReferencesManager.GetReferencedClass("Payer"));
        }

        [TestCase]
        public void FieldSourceNotFound_ShouldReturnEmpty()
        {
            List<FieldSourceViewModel> fieldSources = new List<FieldSourceViewModel>();
            FieldSourceViewModel fieldSourceViewModel = new FieldSourceViewModel
            {
                id = "NoPayer",
                class_uri = @"classes\145"
            };

            fieldSources.Add(fieldSourceViewModel);

            ClassViewModel customerClass = new ClassViewModel
            {
                id = "Customer"
            };

            modelService.Setup(x => x.GetFieldSources(It.IsAny<string>())).Returns(fieldSources);
            modelService.Setup(x => x.GetClass(@"classes\145")).Returns(customerClass);

            ClassReferencesManager classReferencesManager = new ClassReferencesManager(modelService.Object);
            classReferencesManager.Initialize("", "");

            Assert.AreEqual("", classReferencesManager.GetReferencedClass("Payer"));
        }

        [TestCase]
        public void ReferencedClassNotFound_ShouldReturnEmpty()
        {
            List<FieldSourceViewModel> fieldSources = new List<FieldSourceViewModel>();
            FieldSourceViewModel fieldSourceViewModel = new FieldSourceViewModel
            {
                id = "Payer",
                class_uri = @"classes\146"
            };

            fieldSources.Add(fieldSourceViewModel);

            ClassViewModel customerClass = new ClassViewModel
            {
                id = "Customer"
            };

            modelService.Setup(x => x.GetFieldSources(It.IsAny<string>())).Returns(fieldSources);
            modelService.Setup(x => x.GetClass(@"classes\145")).Returns(customerClass);

            ClassReferencesManager classReferencesManager = new ClassReferencesManager(modelService.Object);
            classReferencesManager.Initialize("", "");

            Assert.AreEqual("", classReferencesManager.GetReferencedClass("Payer"));
        }
    }
}

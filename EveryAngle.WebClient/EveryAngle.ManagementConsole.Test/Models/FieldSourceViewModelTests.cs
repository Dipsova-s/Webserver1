using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemInformation;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Models;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Test.Models
{
    public class FieldSourceViewModelTests : UnitTestBase
    { 
        [TestCase]
        public void Can_GetUri()
        {
            FieldSourceViewModel fieldSourceViewModel = new FieldSourceViewModel();
            fieldSourceViewModel.uri = new Uri(@"//everyangle.com/testuri");
            Assert.IsNotEmpty(fieldSourceViewModel.uri.ToString());
        }
    }
}

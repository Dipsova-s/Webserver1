//=============================================================================
// $File: //M4/Work/Sub10/NET/Backend/BackendServer/EveryAngle.Edgar.FullTest/Datastores/BaseTextDatastorePluginTests.cs $
// $Revision: #4 $
// $DateTime: 2016/07/21 06:35:36 $
// $Author: ksawangbumrung $
// $Copyright: ฉ 1996 - 2007 Every Angle Software Solutions BV <EXTLINK http://www.every-angle.com/>Every Angle</EXTLINK> $
//=============================================================================

using EveryAngle.WebClient.Domain;
using EveryAngle.WebClient.Web.Controllers;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using NUnit.Framework;
using System;

namespace EveryAngle.WebClient.Web.CSTests.ControllerTest
{
    [TestFixture]
    public class PivotControllerTests : UnitTestBase
    {
        private readonly PivotController controller = new PivotController();

        [TestFixtureSetUp]
        public void Initialize() 
        {
            //Do nothing
        }

        [Test]
        public void Pivot_Get_Field_Value_With_Fieldtype_Time()
        {
            //Mock datetime 01/01/2016 5.00.00 am
            DateTime datetime = new DateTime(2016, 1, 1, 5, 0, 0);

            object value = controller.GetFieldValue(datetime, EveryAngleEnums.FIELDTYPE.TIME);

            //Assertion : Expected result is 18000
            Assert.AreEqual(18000, Convert.ToInt32(value),
                            string.Format("Get field value with fieldtype 'time' must be 18000"));
        }

        [Test]
        public void Pivot_Get_Field_Value_With_Fieldtype_DateTime()
        {
            //Mock datetime 01/01/2016 5.00.00 am
            DateTime datetime = new DateTime(2016, 1, 1, 5, 0, 0);

            object value = controller.GetFieldValue(datetime, EveryAngleEnums.FIELDTYPE.DATETIME);

            //Assertion : Expected result is 1451624400
            Assert.AreEqual(1451624400, Convert.ToInt32(value), "Get field value with fieldtype 'datetime' must be 1451624400");
        }

        [Test]
        public void Pivot_Get_Field_Value_With_Fieldtype_Date()
        {
            //Mock datetime 01/01/2016 5.00.00 am
            DateTime datetime = new DateTime(2016, 1, 1, 5, 0, 0);

            object value = controller.GetFieldValue(datetime, EveryAngleEnums.FIELDTYPE.DATETIME);

            //Assertion : Expected result is 1451624400
            Assert.AreEqual(1451624400, Convert.ToInt32(value), "Get field value with fieldtype 'date' must be 1451624400");
        }

        [Test]
        public void Pivot_Get_Field_Value_With_Null_Data()
        {
            object value = controller.GetFieldValue(null, EveryAngleEnums.FIELDTYPE.TIME);

            //Assertion : Expected result is 1451624400
            Assert.IsNull(value, "Get field value with 'null' data must be null");
        }
    }
}

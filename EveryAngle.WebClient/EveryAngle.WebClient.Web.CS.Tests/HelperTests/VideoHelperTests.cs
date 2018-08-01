using EveryAngle.WebClient.Web.CSTests.TestBase;
using EveryAngle.WebClient.Web.Helpers;
using NUnit.Framework;
using System.IO;

namespace EveryAngle.WebClient.Web.CS.Tests.ControllerTest
{
    [TestFixture]
    public class VideoHelperTests : UnitTestBase
    {
        #region tests
        
        [TestCase("/resource", "test.mp4", "test", "/resource/test.mp4", "video/mp4")]
        public void Can_GetVideoPlayList(string dir,string filename, string expectedName, string expectedSrc, string expectedType)
        {
            var file = new FileInfo(filename);
            var video = VideoHelper.GetVideoPlayList(file, dir);

            Assert.IsNotNull(video);
            Assert.AreEqual(expectedName, video.name);
            Assert.AreEqual(expectedSrc, video.sources[0].src);
            Assert.AreEqual(expectedType, video.sources[0].type);
        }

        [TestCase("01 - test 23", "01-test23")]
        [TestCase("0123456", "0123456")]
        public void Can_GetVideoThumbnailName(string videoName, string expectedVideoName)
        {
            string newName = VideoHelper.GetVideoThumbnailName(videoName);

            Assert.AreEqual(expectedVideoName, newName);
        }

        #endregion

    }
}

using EveryAngle.Core.ViewModels.Comment;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class CommentViewModelTest : UnitTestBase
    {
        [TestCase]
        public void CommentViewModel_TEST()
        {
            //arrange
            CommentViewModel viewModel = new CommentViewModel
            {
                comment_type = "comment",
                CreatedBy = new UserDateViewModel(),
                comment = "comment"
            };

            //assert type
            Assert.AreEqual(viewModel.comment_type.GetType(), typeof(string));
            Assert.AreEqual(viewModel.CreatedBy.GetType(), typeof(UserDateViewModel));
            Assert.AreEqual(viewModel.comment.GetType(), typeof(string));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("comment_type"));
            Assert.IsTrue(viewModelSerialize.Contains("created"));
            Assert.IsTrue(viewModelSerialize.Contains("comment"));
        }
    }
}

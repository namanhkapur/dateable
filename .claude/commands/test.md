# Test Generation Command
Please generate comprehensive tests for: $ARGUMENTS
Include:
- Unit tests for core functions
- Integration tests for API endpoints
- Error handling test cases
- Edge case scenarios

Example test (project code unrelated):

// import expect from 'expect';
// import { ZonedDateTime } from '@js-joda/core';
// import { dbDescribe, dbTest } from '../helpers/db-test';
// import { createAuthor, createPrediction } from '../models/author-models';
// import { AuthorsService } from '../../src/modules/authors/authors-service';
// import { AuthorPredictionsPersister } from '../../src/modules/author-predictions/author-predictions-persister';
// import { AuthorPredictionResultsPersister } from '../../src/modules/author-prediction-results/author-prediction-results-persister';

// dbDescribe('test author predictions results persister', () => {
//   describe('basic persister tests', () => {
//     dbTest('upsert', async (context) => {
//       const author = await AuthorsService.upsertAuthor(context, createAuthor());
//       const initPrediction = await AuthorPredictionsPersister.upsertPrediction(
//         context,
//         createPrediction({ authorId: author.id }),
//       );
//       const result =
//         await AuthorPredictionResultsPersister.upsertAuthorPredictionResult(
//           context,
//           {
//             authorPredictionId: initPrediction.id,
//             startPrice: 100,
//             startPriceAccuracy: 'Days',
//             startPriceTime: ZonedDateTime.now(),
//             marketType: 'YAHOO',
//           },
//         );
//       const resultByPrediction =
//         await AuthorPredictionResultsPersister.getPredictionResultsByPredictionId(
//           context,
//           initPrediction.id,
//         );
//       const resultById =
//         await AuthorPredictionResultsPersister.getPredictionResult(
//           context,
//           result.id,
//         );
//       expect(resultByPrediction).toEqual(resultById);
//     });
//     dbTest('delete', async (context) => {
//       const author = await AuthorsService.upsertAuthor(context, createAuthor());
//       const initPrediction = await AuthorPredictionsPersister.upsertPrediction(
//         context,
//         createPrediction({ authorId: author.id }),
//       );
//       const result =
//         await AuthorPredictionResultsPersister.upsertAuthorPredictionResult(
//           context,
//           {
//             authorPredictionId: initPrediction.id,
//             startPrice: 100,
//             startPriceAccuracy: 'Days',
//             startPriceTime: ZonedDateTime.now(),
//             marketType: 'YAHOO',
//           },
//         );
//       const resultByPrediction =
//         await AuthorPredictionResultsPersister.getPredictionResultsByPredictionId(
//           context,
//           initPrediction.id,
//         );
//       const resultById =
//         await AuthorPredictionResultsPersister.getPredictionResult(
//           context,
//           result.id,
//         );
//       expect(resultByPrediction).toEqual(resultById);
//       await AuthorPredictionResultsPersister.deleteAuthorPredictionResult(
//         context,
//         result.id,
//       );
//       const resultByIdAfterDelete =
//         await AuthorPredictionResultsPersister.getPredictionResult(
//           context,
//           result.id,
//         );
//       expect(resultByIdAfterDelete === undefined).toBeTruthy();
//     });
//   });
// });




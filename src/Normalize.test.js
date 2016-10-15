/* eslint-env mocha */
import { assert } from 'chai';
import gql from 'graphql-tag';

import { normalizeQuery } from './Normalize';


const testQueries = [
  [
    'basic test',
    gql`{
      user {
        name
      }
    }`,
    '{user {name}}',
  ],
  [
    'basic test with query',
    gql`query {
      user {
        name
      }
    }`,
    '{user {name}}',
  ],
  [
    'basic with operation name',
    gql`query OpName {
      user {
        name
      }
    }`,
    'query OpName {user {name}}',
  ],
  [
    'fragment',
    gql`{
      user {
        name
        ...Bar
      }
    }
    fragment Bar on User {
      asd
    }
    fragment Baz on User {
      jkl
    }`,
    '{user {name ...Bar}} fragment Bar on User {asd}',
  ],
  [
    'full test',
    gql`query Foo ($b: Int, $a: Boolean){
      user(name: "hello", age: 5) {
        ... Bar
        ... on User {
          hello
          bee
        }
        tz
        aliased: name
      }
    }
    fragment Baz on User {
      asd
    }
    fragment Bar on User {
      age @skip(if: $a)
      ...Nested
    }
    fragment Nested on User {
      blah
    }`,
    'query Foo($a:Boolean,$b:Int) {user(age:0, name:"") {name tz ...Bar ... on User {bee hello}}}' +
    ' fragment Bar on User {age @skip(if:$a) ...Nested} fragment Nested on User {blah}',
  ],
];

describe('normalizeQuery', () => {
  testQueries.forEach(([testName, inputDocument, outString]) => {
    it(testName, () => {
      const fragments = {};
      let operation = null;
      inputDocument.definitions.forEach((def) => {
        if (def.kind === 'OperationDefinition') {
          operation = def;
        }
        if (def.kind === 'FragmentDefinition') {
          fragments[def.name.value] = def;
        }
      });
      const fakeInfo = {
        operation,
        fragments,
      };
      const normalized = normalizeQuery(fakeInfo);
      // console.log(normalized);
      assert.equal(normalized, outString, 'normalize');
    });
  });
});

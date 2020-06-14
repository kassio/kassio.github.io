---
layout: post
title: "Postgres Array Aggregation on Ruby on Rails"
---

## [The problem](#the-problem)

In a blog, one may want to create a menu to filter the blog posts by year and
month. A nested list, like:

* [2020]()
  * [January]()
  * [February]()
  * [May]()
* [2019]()
  * [January]()
  * [April]()
  * [May]()
  * [July]()
  * [August]()

### [Querying the data](#querying-the-data)

Postgres is a powerful database. Recently, I learned about its `array_agg`
function, which, as you can imagine, aggregates a column and in an array.

There's a few ways to do that, I'll explore how one could could query the
database to retrieve the required data using the `array_agg` to fetch an array
of the months for each year.

The query may look like:

```sql
SELECT
  year,
  array_agg(DISTINCT month)
FROM (
  SELECT
    date_part('year', created_at) AS year,
    date_part('month', created_at) AS month
  FROM
    posts
) AS posts_years_months
GROUP BY year;

 year |       array_agg
------+--------------------------
 2020 | {1, 2, 3, 4}
```

## [Ruby on Rails side of things](#ruby-on-rails-side-of-things)

I'll share here two ways, that I didn't see in many blog posts, about how to use
this query in a Ruby on Rails application.

### ["ReadOnly" Model](#readonly-model)

So, one could create a new model, `PostCollection` and use the [`attribute`](https://api.rubyonrails.org/classes/ActiveRecord/Attributes/ClassMethods.html#method-i-attribute)
method to define the `year` and `months`.

```ruby
# app/models/post_collection.rb
class PostCollection < ApplicationRecord
  self.table_name = :posts
  self.ignored_columns = columns.map(&:name)

  def readonly?
    true
  end

  attribute :year, :integer
  attribute :months, :integer, array: true

  default_scope {
    query = <<~EOS.squish
      SELECT
        year as year,
        array_agg(DISTINCT month) as months
      FROM (
        SELECT
          date_part('year', created_at) AS year,
          date_part('month', created_at) AS month
        FROM
          posts
      ) AS posts_years_months
      GROUP BY year;
    EOS

    find_by_sql(query)
  }
end
```

```
>> PostCollection.all
  PostCollection Load (0.8ms)  SELECT year as year, array_agg(DISTINCT month) as months
  FROM ( SELECT date_part('year', created_at) AS year, date_part('month', created_at)
  AS month FROM posts ) AS posts_years_months GROUP BY year;
=> [#<PostCollection year: 2018, months: [6, 7, 8, 9, 10, 11, 12]>,
#<PostCollection year: 2019, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]>,
#<PostCollection year: 2020, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]>,
#<PostCollection year: 2021, months: [1, 2, 3, 4, 5, 6]>]
```

There are a few more tricks in that.

- `def readonly?` - The instances of this model cannot update the database.
- `self.ignored_columns = columns.map(&:name)` - Ignore all the columns from the
    table and use only the ones defined in the model. Since this model is only
    using _calculated_ columns, there's not need to have attributes related to
    the table columns.

### [ActiveModel::Model + ActiveModel::Attributes](#activemodelmodel--activemodelattributes)

Another way to do it would to use a non-ActiveRecord model, instead, using the
`ActiveModel::Attributes` to define the attributes.

```ruby
# app/models/post_collection.rb
class PostCollection
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :year, :integer
  attribute :months, :array, type: :integer

  def self.all
    query = <<~EOS.squish
      SELECT
        year,
        array_agg(DISTINCT month) as months
      FROM (
        SELECT
          date_part('year', created_at) AS year,
          date_part('month', created_at) AS month
        FROM
          posts
      ) AS posts_years_months
      GROUP BY year;
    EOS

    ApplicationRecord
      .connection
      .select_all(query)
      .to_a
      .map { |record| new(record) }
  end

  def inspect
    format(
      "#<PostCollection %{attributes} >",
      attributes: attributes.map { |key, value| "#{key}=#{value}" }.join(" ")
    )
  end
end
```

The _problem_ with this is that `ActiveModel::Attributes` doesn't provide this
`:array` type. So we need to create it. To avoid _reinventing the wheel_, you
can use the power of the [`pg`](https://github.com/ged/ruby-pg) gem, to
encode/decode the array on the postgres format.

```ruby
# app/models/types/array.rb
module Types
  class Array < ActiveModel::Type::Value
    def initialize(type:)
      @type = ActiveModel::Type.lookup(type)
    end

    def type
      :array
    end

    def cast(value)
      case value
      when Enumerable
        value
      else
        PG::TextDecoder::Array.new.decode(value).map do |value|
          @type.cast(value)
        end
      end
    end

    def serialize(value)
      PG::TextEncoder::Array.new.encode(Array.wrap(value))
    end
  end
end
```

As you can see in the code above, after _splitting_ the array this custom type
is _casting_ each object of the array in a given type. You can check what types
Ruby on Rails provides by default [in this file](https://github.com/rails/rails/blob/master/activemodel/lib/active_model/type.rb)


At last, the new custom type needs to be registered in the `ActiveModel::Type`,
so we can add a initializer for that

```ruby
# config/initializers/types.rb
ActiveModel::Type.register(:array, Types::Array)
```

### [Postgres View](#postgres-view)

There's a very good blog post about that, by Leigh Halliday, [in here](https://pganalyze.com/blog/materialized-views-ruby-rails)

## [Conclusion](#conclusion)

It depends.

I don't think I'd use the `ReadOnly Model` approach, although it has less code,
I think its _fake_ ActiveRecord behavior can mislead developers.

Writing a Postgres View is nice, if the query is too complex I'd rather keep it
in the database. However, it'd require to run migrations to update the query.

So, if the query is not too complex I'd use the `ActiveModel::Model +
ActiveModel::Attributes` approach. I think it requires a reasonable amount of
moving pieces, but it, at least, doesn't mislead future developers.

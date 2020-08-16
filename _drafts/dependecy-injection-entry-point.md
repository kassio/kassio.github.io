---
layout: post
title: Code entry point
---

# Inheritance
There's no single entry point. This makes the code less extensible and hard
dependency between the behaviors.

```ruby
module Inheritance
  class CreateService
    def initialize(params = {})
      @params = params
    end

    def execute
      "original"
    end
  end

  class CreateFromTemplateService < CreateService
    def execute
      "#{super} from template"
    end
  end
end
```


# The entry point has the default behavior
The default behavior is customizable with dependency injection.
Each behavior is implements a decorator pattern based on the default behavior
Dependency between behaviors may became:
- complex with composition + delegation
- implicity with nested delegations

```ruby
module RouterWithDecoratedDependencyInjection
  class CreateService
    def initialize(params = {})
      @params = params
    end

    def execute(decorator: nil)
      if decorator.nil?
        "original"
      else
        decorator.new(self).execute
      end
    end
  end

  class FromTemplate < SimpleDelegator
    def execute
      "#{super} + FromTemplate"
    end
  end

  class OtherBehavior < SimpleDelegator
    def execute
      "other behavior + #{super}"
    end
  end
end
```


# With router entry point - dependency injection

The entry point works as a router, choosing the behavior based
on the dependency injected.
Dependency between behaviors can be achieved with composition
- It's more verbose
- It's more explicit

```ruby
module RouterWithDependencyInjection
  class CreateService
    def initialize(params = {})
      @params = params
    end

    def execute(with: Default)
      with.new(@params).execute
    end

    class Default
      def initialize(params = {})
        @params = params
      end

      def execute
        "original"
      end
    end
  end

  class FromTemplate
    def initialize(params = {})
      @params = params
      @base = CreateService::Default.new(params)
    end

    def execute
      "from template #{@base.execute}"
    end
  end
end
```

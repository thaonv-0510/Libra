# config valid for current version and patch releases of Capistrano
lock "~> 3.17.2"

set :user, 'deploy'
set :application, "Libra"
set :repo_url, "git@github.com:thaonguyen1995/Libra.git"
set :pty, true
set :linked_files, %w(config/database.yml config/application.yml)
set :linked_dirs, %w(log tmp/pids tmp/cache tmp/sockets public/system public/uploads)
set :puma_pid, -> {"#{shared_path}/tmp/pids/puma.pid"}
set :puma_preload_app, true

namespace :deploy do
  desc "yarn install"
  task :yarn_install do
    on roles(:app) do |host|
      within release_path do
        with rails_env: ENV["RAILS_ENV"] do
          execute("cd #{release_path} && yarn install --check-files")
        end
      end
    end
  end

  desc "create database"
  task :create_database do
    on roles(:db) do |host|
      within release_path do
        with rails_env: ENV["RAILS_ENV"] do
          execute :rake, "db:create"
        end
      end
    end
  end
  before :migrate, :create_database
end

before "deploy:assets:precompile", "deploy:yarn_install"

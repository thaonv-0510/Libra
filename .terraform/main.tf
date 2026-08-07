terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.1.0"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "default" {
  ami = "ami-055744c75048d8296"
  instance_type = "t2.micro"

  tags = {
    Name = "Libra"
  }
}

#!/bin/bash

# prerequisites check

# Check for Terraform
if command -v terraform --version &> /dev/null; then
    echo "Terraform is installed."
else
    echo "Terraform is NOT installed."
    sudo yum install -y yum-utils shadow-utils
    sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo
    sudo yum -y install terraform-1.10.3
    # Check if Terraform is working after installation
    if command -v terraform --version &> /dev/null; then
        echo "Terraform successfully installed."
    else
        echo "Terraform installation failed."
    fi
fi

# Check for Docker
if command -v docker --version &> /dev/null; then
    echo "Docker is installed."
     # Check if Docker daemon is running
    if sudo systemctl is-active --quiet docker; then
        echo "Docker daemon is running."
    else
        echo "Docker daemon is not running. Starting Docker..."
        sudo systemctl start docker
        sudo systemctl enable docker
        echo "Docker service started and enabled to run on boot."
    fi
else
    echo "Docker is NOT installed."
    sudo yum -y install docker
    # Check if docker is working after installation
    if command -v docker --version &> /dev/null; then
        echo "docker successfully installed."
        systemctl start docker
        systemctl enable docker
        echo "Docker service started and enabled to run on boot."
    else
        echo "docker installation failed."
    fi
fi

# deployment

cd ./deployment
terraform init
terraform plan
terraform apply -auto-approve